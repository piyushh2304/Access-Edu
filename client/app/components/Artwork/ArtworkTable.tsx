"use client";
import React, { useState, useEffect } from 'react';
import { DataGrid, GridColDef, GridPaginationModel, GridRowSelectionModel } from '@mui/x-data-grid';
import { Box, Button, TextField, Typography, Paper, Alert, CircularProgress } from '@mui/material';
import { useArtworkSelection } from '../../hooks/useArtworkSelection';

interface Artwork {
  id: number;
  title: string;
  artist_display: string;
  date_display: string;
}

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 90 },
  { field: 'title', headerName: 'Title', width: 300 },
  { field: 'artist_display', headerName: 'Artist', width: 250 },
  { field: 'date_display', headerName: 'Date', width: 150 },
];

const ArtworkTable = () => {
  // Table Data State
  const [rows, setRows] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });

  // Custom Selection Hook
  const { 
    selectedIds, 
    selectRows, 
    isSelecting, 
    error,
    setSelection
  } = useArtworkSelection();

  // Local state for the "Select N rows" input
  const [selectCount, setSelectCount] = useState<string>('');

  // Fetch Visible Rows for the Table
  useEffect(() => {
    const fetchTableData = async () => {
      setLoading(true);
      try {
        // API uses 1-based indexing for pages
        const page = paginationModel.page + 1;
        const limit = paginationModel.pageSize;
        const res = await fetch(`https://api.artic.edu/api/v1/artworks?page=${page}&limit=${limit}&fields=id,title,artist_display,date_display`);
        const json = await res.json();
        
        setRows(json.data || []);
        setTotalRows(json.pagination?.total || 0);
      } catch (err) {
        console.error("Failed to fetch table data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTableData();
  }, [paginationModel]);


  const handleBulkSelect = async () => {
    const count = parseInt(selectCount, 10);
    if (!isNaN(count) && count > 0) {
      await selectRows(count);
    }
  };

  return (
    <Paper sx={{ height: 600, width: '100%', p: 2 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Artwork Selection
      </Typography>
      
      {/* Bulk Selection UI */}
      <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          label="Number of rows to select"
          type="number"
          size="small"
          value={selectCount}
          onChange={(e) => setSelectCount(e.target.value)}
          disabled={isSelecting}
          sx={{ width: 200 }}
        />
        <Button 
          variant="contained" 
          onClick={handleBulkSelect}
          disabled={isSelecting || !selectCount}
          startIcon={isSelecting ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {isSelecting ? 'Selecting...' : 'Select Rows'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Total Selected: {selectedIds.length}
        </Typography>
      </Box>

      <DataGrid
        rows={rows}
        columns={columns}
        rowCount={totalRows}
        loading={loading}
        pageSizeOptions={[10, 25, 50, 100]}
        paginationModel={paginationModel}
        paginationMode="server"
        onPaginationModelChange={setPaginationModel}
        checkboxSelection
        
        // Bind selection state
        rowSelectionModel={selectedIds}
        keepNonExistentRowsSelected
        
        // Disable automatic selection update from the grid to avoid loops if not carefully managed
        // or strictly strictly sync:
        onRowSelectionModelChange={(newModel) => {
            setSelection(newModel as number[]);
        }}
      />
    </Paper>
  );
};

export default ArtworkTable;
