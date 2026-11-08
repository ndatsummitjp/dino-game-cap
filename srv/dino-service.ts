import cds from '@sap/cds';

type ImageField = 'idle_image' | 'run_1_image' | 'run_2_image' | 'jump_image' | 'crash_image';

type ImageUpload = {
  id: string;
  IsActiveEntity?: boolean;
  fileName: string;
  content: string | Uint8Array;
};

type PreparedImageUpload = {
  id: string;
  IsActiveEntity: boolean;
  fileName: string;
  field: ImageField;
  image: Uint8Array;
  mediaType: string;
};

type UploadRequest = {
  data: { images?: ImageUpload[] };
  user: { id: string };
  reject: (status: number, message: string) => never;
};

const imageFields: Record<ImageField, string> = {
  idle_image: 'idle_image_mediaType',
  run_1_image: 'run_1_image_mediaType',
  run_2_image: 'run_2_image_mediaType',
  jump_image: 'jump_image_mediaType',
  crash_image: 'crash_image_mediaType'
};

const imageTypes: Record<string, { mediaType: string; matches: (image: Uint8Array) => boolean }> = {
  '.gif': {
    mediaType: 'image/gif',
    matches: (image) => String.fromCharCode(...image.subarray(0, 3)) === 'GIF'
  },
  '.jpeg': {
    mediaType: 'image/jpeg',
    matches: (image) => image[0] === 0xff && image[1] === 0xd8 && image[2] === 0xff
  },
  '.jpg': {
    mediaType: 'image/jpeg',
    matches: (image) => image[0] === 0xff && image[1] === 0xd8 && image[2] === 0xff
  },
  '.png': {
    mediaType: 'image/png',
    matches: (image) => {
      const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
      return signature.every((byte, index) => image[index] === byte);
    }
  },
  '.webp': {
    mediaType: 'image/webp',
    matches: (image) => String.fromCharCode(...image.subarray(0, 4)) === 'RIFF'
      && String.fromCharCode(...image.subarray(8, 12)) === 'WEBP'
  }
};

const maxImageSize = 10 * 1024 * 1024;
const base64Pattern = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

function prepareImageUpload(
  { id, IsActiveEntity = true, fileName, content }: ImageUpload,
  req: UploadRequest
): PreparedImageUpload | null {
  const safeFileName = typeof fileName === 'string'
    ? fileName.replace(/\\/g, '/').split('/').pop() ?? ''
    : '';
  const extension = safeFileName.slice(safeFileName.lastIndexOf('.')).toLowerCase();
  const field = safeFileName.slice(0, safeFileName.lastIndexOf('.')).toLowerCase();
  const imageType = imageTypes[extension];

  if (!Object.prototype.hasOwnProperty.call(imageFields, field)) {
    return null;
  }
  if (!id || typeof IsActiveEntity !== 'boolean' || !imageType) {
    return req.reject(400, 'Use an image filename matching an image field, such as idle_image.png.');
  }

  let image: Uint8Array;
  if (typeof content === 'string') {
    if (!base64Pattern.test(content)) {
      return req.reject(400, 'Image content must be valid base64-encoded binary data.');
    }
    const binary = atob(content);
    image = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  } else if (content instanceof Uint8Array) {
    image = content;
  } else {
    return req.reject(400, 'Image content must be provided as a binary file.');
  }

  if (image.length === 0 || image.length > maxImageSize) {
    return req.reject(400, 'Image files must be between 1 byte and 10 MiB.');
  }
  if (!imageType.matches(image)) {
    return req.reject(400, 'Image content does not match the file extension.');
  }

  return { id, IsActiveEntity, fileName, field: field as ImageField, image, mediaType: imageType.mediaType };
}

export default cds.service.impl(function () {
  const { Characters } = this.entities;

  this.on('uploadCharacterImages', async (req: UploadRequest) => {
    const { images } = req.data;
    if (!Array.isArray(images) || images.length === 0) {
      return req.reject(400, 'Provide at least one image to upload.');
    }

    const uploads = images.flatMap((image) => {
      const upload = prepareImageUpload(image, req);
      return upload ? [upload] : [];
    });
    if (uploads.length === 0) {
      return req.reject(400, 'No filenames matched a supported image field.');
    }
    const updatesByCharacter = new Map<string, Set<ImageField>>();
    for (const upload of uploads) {
      const characterKey = `${upload.id}:${upload.IsActiveEntity}`;
      const updates = updatesByCharacter.get(characterKey) ?? new Set();
      if (updates.has(upload.field)) {
        return req.reject(400, `The batch contains more than one ${upload.field} image for character ${upload.id}.`);
      }
      updates.add(upload.field);
      updatesByCharacter.set(characterKey, updates);
    }

    const targetByState = new Map<boolean, typeof Characters>();
    for (const isActiveEntity of new Set(uploads.map(({ IsActiveEntity }) => IsActiveEntity))) {
      const target = isActiveEntity ? Characters : Characters.drafts;
      if (!target) {
        return req.reject(400, 'Character drafts are not enabled.');
      }
      targetByState.set(isActiveEntity, target);
    }

    for (const characterKey of updatesByCharacter.keys()) {
      const separatorIndex = characterKey.lastIndexOf(':');
      const id = characterKey.slice(0, separatorIndex);
      const isActiveEntity = characterKey.slice(separatorIndex + 1) === 'true';
      const target = targetByState.get(isActiveEntity);
      if (!target) {
        return req.reject(400, 'Character state is not supported.');
      }
      const character = await SELECT.one.from(target).where({ id });
      if (!character) {
        return req.reject(404, `Character ${id} was not found.`);
      }
      if (!isActiveEntity) {
        const draftUuid = character.DraftAdministrativeData_DraftUUID;
        const draftAdmin = await SELECT.one.from('DRAFT.DraftAdministrativeData')
          .columns('InProcessByUser')
          .where({ DraftUUID: draftUuid });
        if (draftAdmin?.InProcessByUser !== req.user.id) {
          return req.reject(403, 'Only the owner of the character draft can upload images.');
        }
      }
    }

    for (const upload of uploads) {
      const target = targetByState.get(upload.IsActiveEntity);
      if (!target) {
        return req.reject(400, 'Character state is not supported.');
      }
      await UPDATE(target)
        .set({
          [upload.field]: Buffer.from(upload.image),
          [imageFields[upload.field]]: upload.mediaType
        })
        .where({ id: upload.id });
    }

    return uploads.map(({ id, fileName }) => ({ id, fileName }));
  });
});
