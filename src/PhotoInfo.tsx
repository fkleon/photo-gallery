import { FC, useEffect, useState } from "react";
import { styled, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import Button from '@mui/material/Button';
import CircularProgress from "@mui/material/CircularProgress";
import CloseIcon from '@mui/icons-material/Close';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Divider from "@mui/material/Divider";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Grid from "@mui/material/Grid";
import IconButton from '@mui/material/IconButton';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import Typography from "@mui/material/Typography";

import { PhotoType } from "./types";
import { useGetPhotoInfoQuery } from "./services/api";

import Map from "./Map";

interface InfoPanelProps {
    photos: PhotoType[];
    selected: number;
    onClose?: () => void;
}

const StyledList = styled("dl")({
    width: "100%",
    '& dt': {
        width: "50%",
        display: "inline-block",
        textAlign: "right",
        padding: 3
    },
    '& dd': {
        width: "50%",
        display: "inline-block",
        marginInlineStart: 0,
        padding: 3
    }
});

const PhotoInfo: FC<InfoPanelProps> = ({ photos, selected, onClose }) => {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const [ index, setIndex ] = useState(selected);
    const { title, src: thumb, info } = photos[index] || {};
    const { data = [], isFetching } = useGetPhotoInfoQuery(info, {skip: info === undefined});

    useEffect(() => setIndex(selected), [setIndex, selected]);

    const hasBefore = index > 0;
    const hasNext = index < photos.length - 1;

    const mapLocation = data[0]?.imageinfo?.location;

    const handleClose = () => {
        setIndex(-1);
        if(onClose !== undefined)
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
            open={index >= 0}
            onKeyDown={onKeyDown}
            fullScreen={fullScreen}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle id="photo-info-title">
                {title}
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
                        <img src={thumb} alt={title} style={{ width: "100%", height: "200px", objectFit: "cover" }} />
                    </Grid>
                    <Grid item xs={8}>
                        {mapLocation?.present && <Map height="200px" mark={mapLocation} />}
                    </Grid>
                </Grid>
                {data.map((file: any) => (
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
                                {/* <dt>Url</dt><dd><a href={file.url}>{file.url}</a></dd> */}
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
                                    {Object.entries(file.imageinfo.exif).map(([key, value]) => (<>
                                        <dt key={key}>{key}</dt>
                                        <dd key={key+"-val"}>{String(value)}</dd>
                                    </>))}
                                </StyledList>
                            </>)}
                            <Typography textAlign="center" variant='h6'>File Stat</Typography>
                            <Divider />
                            <StyledList>
                                <dt>Name</dt><dd>{file.filestat.name}</dd>
                                <dt>Size</dt><dd>{file.filestat.sizehuman} ({file.filestat.size.toLocaleString()} bytes)</dd>
                                <dt>Modification Time</dt><dd>{file.filestat.modtime}</dd>
                                <dt>Permissions</dt><dd>{file.filestat.perm}</dd>
                            </StyledList>
                        </AccordionDetails>
                    </Accordion>
                ))}

            </DialogContent>
            <DialogActions>
                <Button autoFocus onClick={handleClose}>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default PhotoInfo;
