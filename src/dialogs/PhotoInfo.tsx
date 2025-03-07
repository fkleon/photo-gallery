import { FC, Suspense, lazy, useEffect, useState } from "react";
import { styled, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import CloseIcon from '@mui/icons-material/Close';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Divider from "@mui/material/Divider";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Grid from "@mui/material/Grid";
import IconButton from '@mui/material/IconButton';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DoneIcon from '@mui/icons-material/Done';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import Typography from "@mui/material/Typography";

import { FileExtendedInfo, PhotoType, urls } from "../types";
import { useGetPhotoInfoQuery } from "../services/api";

const Map = lazy(() => import("../Map"));

interface InfoPanelProps {
    open: boolean;
    photos: PhotoType[];
    selected: number;
    onClose: () => void;
}

const StyledList = styled("dl")({
    width: "100%",
    '& dt': {
        width: "50%",
        display: "inline-block",
        textAlign: "right",
        fontWeight: "bold",
        padding: 3
    },
    '& dd': {
        width: "50%",
        display: "inline-block",
        marginInlineStart: 0,
        padding: 3
    }
});

const SummaryStyledList = styled("dl")({
    width: "100%",
    '& dt': {
        fontWeight: "bold"
    },
});

const PhotoInfoDialog: FC<InfoPanelProps> = ({ open, photos, selected, onClose }) => {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const [ index, setIndex ] = useState(selected);
    const [ copied, setCopied ] = useState(false);
    const photo = photos[index];
    const { data, isFetching } = useGetPhotoInfoQuery(photo, {skip: photo === undefined});

    useEffect(() => setIndex(selected), [setIndex, selected]);

    // Do not render if is not valid
    if(photo === undefined || data === undefined)
        return null;

    // Main file is the only file, or the first image file.
    const mainFile = (
        data.length < 1 ?
        null : (
            data.length > 1 ?
            data.find(d => d.type === "image") :
            data[0]
        )
    );

    const hasBefore = index > 0;
    const hasNext = index < photos.length - 1;

    const handleClose = () => {
        onClose();
    };

    const handleBefore = () => {
        if(index > 0)
            setIndex(index - 1);
    }
    const handleNext = () => {
        if(index < photos.length - 1)
            setIndex(index + 1);
    }
    const onKeyDown = (event: React.KeyboardEvent) => {
        if (event.defaultPrevented) {
            return; // Do nothing if the event was already processed
        }
        switch (event.key) {
            case "Left": // IE/Edge specific value
            case "ArrowLeft":
                handleBefore();
                break;
            case "Right": // IE/Edge specific value
            case "ArrowRight":
                handleNext();
                break;
        }
    }
    
    return (
        <Dialog
            PaperProps={{ sx: { position: {sm: "fixed"}, top: {sm: 0} } }}
            onClose={handleClose}
            aria-labelledby="photo-info-title"
            open={open}
            onKeyDown={onKeyDown}
            fullScreen={fullScreen}
            maxWidth="lg"
            fullWidth
        >
            <DialogTitle id="photo-info-title">
                {photo.title}
                <Box sx={{ position: 'absolute', right: 8, top: 8 }}>
                    {isFetching && <CircularProgress size="1rem" sx={{ mr: 1 }}/>}
                    <IconButton onClick={handleBefore} disabled={!hasBefore} sx={{ ml: 1 }} aria-label="before">
                        <NavigateBeforeIcon />
                    </IconButton>
                    <IconButton onClick={handleNext} disabled={!hasNext} aria-label="next">
                        <NavigateNextIcon />
                    </IconButton>
                    <IconButton onClick={handleClose} sx={{ ml: 1 }} aria-label="close">
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent dividers>
                <Grid container spacing={2}>
                    <Grid item xs={4}>
                        <img src={urls.thumb(photo)} alt={photo.title} style={{ width: "100%", height: "200px", objectFit: "scale-down" }} />
                        {mainFile?.imageinfo?.fooocus && (<>
                            <SummaryStyledList>
                                <dt>Model</dt><dd>{mainFile?.imageinfo?.fooocus.base_model}</dd>
                                <dt>Positive prompt</dt><dd>{mainFile?.imageinfo?.fooocus.prompt || "—"}</dd>
                                <dt>Negative prompt</dt><dd>{mainFile?.imageinfo?.fooocus.negative_prompt || "—"}</dd>
                            </SummaryStyledList>
                        </>)}
                    </Grid>
                    <Grid item xs={8}>
                        {photo.location.present && <Suspense><Map height="200px" mark={photo.location} /></Suspense>}

                        {data.map((file: FileExtendedInfo) => (
                            <Accordion key={file.filestat.name} defaultExpanded>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography>{file.filestat.name}</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Typography textAlign="center" variant='h6'>Info</Typography>
                                    <Divider />
                                    <StyledList>
                                        <dt>Type</dt><dd>{file.type}</dd>
                                        <dt>MIME</dt><dd>{file.mime}</dd>
                                        {file.imageinfo && (<>
                                            <dt>Format</dt><dd>{file.imageinfo.format.toUpperCase()}</dd>
                                            <dt>Width</dt><dd>{file.imageinfo.width}px</dd>
                                            <dt>Height</dt><dd>{file.imageinfo.height}px</dd>
                                            <dt>Date taken</dt><dd>{file.imageinfo.date}</dd>
                                        </>)}
                                    </StyledList>
                                    {file.imageinfo?.exif && (<>
                                        <Typography textAlign="center" variant='h6'>Metadata</Typography>
                                        <Divider />
                                        <StyledList>
                                            {Object.entries(file.imageinfo.exif).map(([key, value]) => [
                                                (<dt key={key}>{key}</dt>),
                                                (<dd key={key + "-val"}>{String(value)}</dd>)
                                            ])}
                                        </StyledList>
                                    </>)}
                                    {file.imageinfo?.fooocus && (<>
                                        <Typography textAlign="center" variant='h6'>
                                            Fooocus Metadata
                                            <IconButton
                                                title={copied ? "Copied!" : "Copy to clipboard"}
                                                onClick={
                                                    () => {
                                                        navigator.clipboard.writeText(JSON.stringify(file.imageinfo?.fooocus))
                                                        setCopied(true);
                                                    }
                                                }>
                                                {copied ? <DoneIcon /> : <ContentCopyIcon />}
                                            </IconButton>
                                        </Typography>

                                        <Divider />
                                        <StyledList>
                                            {Object.entries(file.imageinfo.fooocus).map(([key, value]) => [
                                                (<dt key={key}>{key}</dt>),
                                                (<dd key={key + "-val"}>{String(value)}</dd>)
                                            ])}
                                        </StyledList>
                                    </>)}
                                    <Typography textAlign="center" variant='h6'>File Stat</Typography>
                                    <Divider />
                                    <StyledList>
                                        <dt>Name</dt><dd>{file.filestat.name}</dd>
                                        <dt>Size</dt><dd>{file.filestat.sizehuman} ({file.filestat.size.toLocaleString()} bytes)</dd>
                                        <dt>Modification Time</dt><dd>{new Date(file.filestat.modtime).toLocaleString()}</dd>
                                        <dt>Permissions</dt><dd>{file.filestat.perm}</dd>
                                    </StyledList>
                                </AccordionDetails>
                            </Accordion>
                        ))}
                    </Grid>
                </Grid>

            </DialogContent>
        </Dialog>
    );
}

export default PhotoInfoDialog;
