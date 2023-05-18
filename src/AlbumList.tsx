import { FC, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

import Box from '@mui/material/Box';
import ClearIcon from '@mui/icons-material/Clear';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import LinearProgress from '@mui/material/LinearProgress';
import SearchIcon from '@mui/icons-material/Search';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { useGetAlbumsQuery } from "./services/api";
import { AlbumType } from './types';

interface AlbumListProps {
    /** Callback when a link is clicked */
    onClick: () => void
}

const AlbumList: FC<AlbumListProps> = ({onClick}) => {
    const { collection, album } = useParams();
    const { data: albums = [], isFetching } = useGetAlbumsQuery({collection}, {skip: collection === undefined});
    const [ searchTerm, setSearchTerm ] = useState<string>("");

    const onSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };
    const clearSearch = () => {
        setSearchTerm("");
    };

    const renderRow = ({ index, style }: ListChildComponentProps<AlbumType>) => {
        const a = albums[index];
        return (
            <ListItem onClick={onClick} style={style} key={a.name} disablePadding>
                <ListItemButton component={Link} to={`/${collection}/${a.name}`} selected={a.name === album}>
                    <ListItemText>
                        <Typography noWrap>{a.name}</Typography>
                    </ListItemText>
                </ListItemButton>
            </ListItem>
        );
    }

    // Render progressbar while loading
    if(isFetching)
        return (
            <Box sx={{ width: '100%' }}>
                <LinearProgress />
            </Box>);
    

    const list = albums.length < 1 ?
        <ListItem><em>Nothing to show</em></ListItem> :
        <AutoSizer>
            {({ height, width }) => 
                <FixedSizeList
                    height={height as number - 48}
                    width={width as number}
                    itemSize={48}
                    itemCount={albums.length}
                    overscanCount={5}>
                        {renderRow}
                </FixedSizeList>
            }
        </AutoSizer>

    return <>
        <TextField
            label="Search albums"
            value={searchTerm}
            onChange={onSearch}
            fullWidth
            variant="filled"
            size="small"
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <SearchIcon />
                    </InputAdornment>),
                endAdornment: (
                    <InputAdornment position="end">
                        <IconButton edge="end" onClick={clearSearch}>
                            <ClearIcon />
                        </IconButton>
                    </InputAdornment>),
                }} />
        {list}
    </>;
}

export default AlbumList;
