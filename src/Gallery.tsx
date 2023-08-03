import { FC, useState, useMemo, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from 'react-redux';

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import LinearProgress from '@mui/material/LinearProgress';
import Paper from "@mui/material/Paper";
import ReportIcon from '@mui/icons-material/Report';
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import PhotoAlbum from "react-photo-album";

import Lightbox from "./Lightbox";
import PhotoInfo from "./PhotoInfo";
import Thumb from "./Thumb";
import useFavorite from "./favoriteHook";
import { PhotoImageType, urls } from "./types";
import { useGetAlbumQuery } from "./services/api";
import { selectZoom } from "./services/app";

const Gallery: FC = () => {
    const { collection = "", album = ""} = useParams();
    const { data, isFetching } = useGetAlbumQuery({collection, album});
    const [ lightboxIndex, setLightboxIndex ] = useState<number>(-1);
    const [ infoPhotoIndex, setInfoPhotoIndex ] = useState<number>(-1);
    const [ subAlbum, setSubAlbum ] = useState<string>("");
    const zoom = useSelector(selectZoom);
    const favorite = useFavorite();

    const subAlbums = data?.subalbums || [];
    const hasSubAlbums = subAlbums.length > 0;
    const isEmptyAlbum = !(Number(data?.photos?.length) > 0);

    const photos = useMemo((): PhotoImageType[] => {
        let list = data?.photos || [];
        // Filter photos by subalbum
        if(subAlbum !== "")
            list = list.filter(v => subAlbum === v.subalbum);
        // Create urls for thumbnails
        return list.map(v => ({...v, src: urls.thumb(v)}));
    }, [data, subAlbum]);

    // Clear sub-album selection when album changed
    useEffect(() => setSubAlbum(""), [collection, album, setSubAlbum]);

    const closeLightbox = () => {
        setLightboxIndex(-1);
    }
    const openInfoPhoto = (index: number) => {
        setInfoPhotoIndex(index);
    }
    const closeInfoPhoto = () => {
        setInfoPhotoIndex(-1);
    }
    const handleSubAlbum = (selected: string) => () => {
        setSubAlbum(selected === subAlbum ? "" : selected);
    }
    const toggleFavorite = (index: number) => {
        favorite.toggle(index, photos);
    }
    
    const RenderPhoto = Thumb(toggleFavorite, setLightboxIndex, setInfoPhotoIndex, zoom >= 100);

    const loading = (
        <Box sx={{ width: '100%' }}>
            <LinearProgress />
        </Box>);
    
    // Center and middle box in viewport
    const emptyAlbum = (
        <Box sx={{ marginTop: "45vh", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <ReportIcon fontSize="large" sx={{m: 1}} />
            <Typography variant="h6">No photos in this album.</Typography>
        </Box>);

    const subAlbumsComp = (
        <Paper elevation={4} square>
            <Stack direction="row" p={1.5} spacing={1} useFlexGap flexWrap="wrap">
                {subAlbums.map(v => <Chip key={v} label={v} variant={subAlbum === v ? "filled" : "outlined"} onClick={handleSubAlbum(v)} />)}
            </Stack>
        </Paper>);

    const gallery = (
        <>
            { hasSubAlbums && subAlbumsComp }
            <PhotoAlbum
                photos={photos}
                layout="rows"
                targetRowHeight={zoom}
                spacing={1}
                renderPhoto={RenderPhoto} />
            <Lightbox
                photos={photos}
                selected={lightboxIndex}
                onClose={closeLightbox}
                onFavorite={toggleFavorite}
                onInfo={openInfoPhoto} />
            <PhotoInfo
                photos={photos}
                selected={infoPhotoIndex}
                onClose={closeInfoPhoto} />
        </>);
    
    return isFetching ? loading :   // Loading
        isEmptyAlbum ? emptyAlbum : // Empty album
        gallery;                    // Gallery
}

export default Gallery;
