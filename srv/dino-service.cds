using { dino.game as db } from '../db/schema';

type CharacterImageUpload {
  id              : UUID;
  IsActiveEntity  : Boolean;
  fileName        : String;
  content         : LargeBinary;
}

type CharacterImageUploadResult {
  id       : UUID;
  fileName : String;
}

service DinoService {
  @odata.draft.enabled: true
  entity Characters as projection on db.Characters;

  action uploadCharacterImages(
    images : many CharacterImageUpload
  ) returns many CharacterImageUploadResult;
}
