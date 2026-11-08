import Button from 'sap/m/Button';
import Dialog from 'sap/m/Dialog';
import List from 'sap/m/List';
import MessageBox from 'sap/m/MessageBox';
import StandardListItem from 'sap/m/StandardListItem';
import ExtensionAPI from 'sap/fe/core/ExtensionAPI';
import Context from 'sap/ui/model/odata/v4/Context';
import MessageToast from 'sap/m/MessageToast';
import BusyIndicator from 'sap/ui/core/BusyIndicator';
import FileUploader from 'sap/ui/unified/FileUploader';
import ODataModel from 'sap/ui/model/odata/v4/ODataModel';
import ResourceModel from 'sap/ui/model/resource/ResourceModel';
import type ResourceBundle from 'sap/base/i18n/ResourceBundle';

function getLocalizedText(bundle: ResourceBundle, key: string, args?: unknown[]): string {
    const text = bundle.getText(key, args);
    if (text === undefined) {
        throw new Error(`Missing translation for "${key}".`);
    }
    return text;
}

function readFileAsBase64(file: File, bundle: ResourceBundle): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result !== 'string') {
                reject(new Error(getLocalizedText(bundle, 'couldNotReadFile', [file.name])));
                return;
            }
            resolve(reader.result.slice(reader.result.indexOf(',') + 1));
        };
        reader.onerror = () => reject(new Error(getLocalizedText(bundle, 'couldNotReadFile', [file.name])));
        reader.readAsDataURL(file);
    });
}

function isFile(file: object): file is File {
    return 'name' in file
        && typeof file.name === 'string'
        && 'size' in file
        && typeof file.size === 'number'
        && 'type' in file
        && typeof file.type === 'string'
        && 'slice' in file
        && typeof file.slice === 'function';
}

async function uploadCharacterImages(
    files: File[],
    selectedContext: Context,
    characterId: string,
    bundle: ResourceBundle
): Promise<void> {
    const model = selectedContext.getModel();
    if (!(model instanceof ODataModel)) {
        throw new Error(getLocalizedText(bundle, 'characterNotBound'));
    }

    BusyIndicator.show(0);
    try {
        const images = await Promise.all(files.map(async (file) => ({
            id: characterId,
            IsActiveEntity: selectedContext.getProperty("IsActiveEntity") !== false,
            fileName: file.name,
            content: await readFileAsBase64(file, bundle)
        })));
        const action = model.bindContext('/uploadCharacterImages(...)');
        action.setParameter('images', images);
        try {
            await action.execute();
        } finally {
            action.destroy();
        }

        await selectedContext.requestRefresh();
        MessageToast.show(getLocalizedText(bundle, 'uploadedImages', [files.length]));
    } catch (error) {
        MessageBox.error(error instanceof Error ? error.message : String(error), {
            title: getLocalizedText(bundle, 'uploadFailed')
        });
    } finally {
        BusyIndicator.hide();
    }
}

/**
 * Generated event handler.
 *
 * @param this reference to the 'this' that the event handler is bound to.
 * @param context the context of the page on which the event was fired. `undefined` for list report page.
 * @param selectedContexts the selected contexts of the table rows.
 */
export async function onUploadButtonPressed(
    this: ExtensionAPI,
    context: Context | undefined,
    selectedContexts: Context[]
): Promise<void> {
    const i18nModel = this.getModel('i18n');
    if (!(i18nModel instanceof ResourceModel)) {
        MessageBox.error('The translation model is not available.');
        return;
    }
    const bundle = await i18nModel.getResourceBundle();
    const contexts = selectedContexts?.length ? selectedContexts : context ? [context] : [];
    if (contexts.length !== 1) {
        MessageBox.error(getLocalizedText(bundle, 'selectOneCharacter'));
        return;
    }

    const selectedContext = contexts[0];
    const characterId = selectedContext.getProperty('id');
    if (typeof characterId !== 'string') {
        MessageBox.error(getLocalizedText(bundle, 'couldNotDetermineCharacter'));
        return;
    }

    let dialog: Dialog;
    let selectedFiles: File[] = [];
    const fileList = new List({
        noDataText: getLocalizedText(bundle, 'noFilesSelected')
    });
    const uploadButton = new Button({
        text: getLocalizedText(bundle, 'upload'),
        enabled: false,
        press: () => {
            if (selectedFiles.length === 0) {
                return;
            }
            dialog.close();
            void uploadCharacterImages(selectedFiles, selectedContext, characterId, bundle);
        }
    });
    const fileUploader = new FileUploader({
        multiple: true,
        fileType: ['png', 'jpg', 'jpeg', 'gif', 'webp'],
        mimeType: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
        change: (event) => {
            const files = event.getParameter('files');
            selectedFiles = Array.from(files ?? []).filter(isFile);
            fileList.destroyItems();
            selectedFiles.forEach((file) => {
                fileList.addItem(new StandardListItem({
                    title: file.name,
                    description: `${(file.size / 1024).toFixed(1)} KB`,
                    icon: 'sap-icon://attachment'
                }));
            });
            uploadButton.setEnabled(selectedFiles.length > 0);
        }
    });
    dialog = new Dialog({
        title: getLocalizedText(bundle, 'chooseImageFiles'),
        content: [fileUploader, fileList],
        beginButton: uploadButton,
        endButton: new Button({
            text: getLocalizedText(bundle, 'cancel'),
            press: () => dialog.close()
        }),
        afterClose: () => dialog.destroy()
    });
    dialog.open();
}