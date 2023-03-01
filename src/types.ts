
export type CollectionType = string;

export interface PseudoAlbumType {
    collection: CollectionType;
    album: AlbumType["name"];
}

export interface AlbumType {
    /** Name of the album */
    name: string;
    photos: PhotoType[];
}

export interface PhotoType {
    src: string;
    title: string;
    type: "image" | "video";
    favorite: boolean;
    width: number;
    height: number;
    files: FileType[];
}

export interface FileType {
    type: string;
    url: string;
}
