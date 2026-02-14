declare module 'react-google-drive-picker' {
    export interface PickerData {
        docs: any[];
        action: string;
    }

    export interface PickerConfiguration {
        clientId: string;
        developerKey: string;
        viewId?: string;
        viewMimeTypes?: string;
        setIncludeFolders?: boolean;
        setSelectFolderEnabled?: boolean;
        token?: string;
        showUploadView?: boolean;
        showUploadFolders?: boolean;
        supportDrives?: boolean;
        multiselect?: boolean;
        customViews?: any[];
        locale?: string;
        callbackFunction: (data: PickerData) => void;
    }

    export type OpenPicker = (config: PickerConfiguration) => void;

    // The hook returns [openPicker, authResponse]
    export default function useDrivePicker(): [any, any];
}
