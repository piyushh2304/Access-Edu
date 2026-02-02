import { useState, useCallback } from 'react';

interface Artwork {
    id: number;
    title: string;
    artist_display: string;
    date_display: string;
}

interface ApiResponse {
    pagination: {
        total: number;
        limit: number;
        offset: number;
        total_pages: number;
        current_page: number;
    };
    data: Artwork[];
}

interface UseArtworkSelectionProps {
    initialSelectedIds?: number[];
    onSelectionChange?: (selectedIds: number[]) => void;
}

export const useArtworkSelection = ({ initialSelectedIds = [], onSelectionChange }: UseArtworkSelectionProps = {}) => {
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set(initialSelectedIds));
    const [isSelecting, setIsSelecting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const selectRows = useCallback(async (count: number) => {
        if (count <= 0) return;

        setIsSelecting(true);
        setError(null);

        const BATCH_SIZE = 100; // Art Institute API default limit can be up to 100
        const pagesToFetch = Math.ceil(count / BATCH_SIZE);

        // Create an array of page numbers to fetch: [1, 2, 3, ...]
        const pageNumbers = Array.from({ length: pagesToFetch }, (_, i) => i + 1);

        try {
            // Parallelize requests
            const promises = pageNumbers.map(page =>
                fetch(`https://api.artic.edu/api/v1/artworks?page=${page}&limit=${BATCH_SIZE}&fields=id`)
                    .then(res => {
                        if (!res.ok) throw new Error(`Failed to fetch page ${page}`);
                        return res.json();
                    })
            );

            const responses: ApiResponse[] = await Promise.all(promises);

            const newSelection = new Set(selectedIds);
            let collectedCount = 0;

            for (const data of responses) {
                if (!data.data) continue;

                for (const artwork of data.data) {
                    if (collectedCount >= count) break;
                    newSelection.add(artwork.id);
                    collectedCount++;
                }
            }

            setSelectedIds(newSelection);
            if (onSelectionChange) {
                onSelectionChange(Array.from(newSelection));
            }

        } catch (err: any) {
            console.error("Bulk selection error:", err);
            setError(err.message || 'Failed to select rows');
        } finally {
            setIsSelecting(false);
        }
    }, [selectedIds, onSelectionChange]);

    const toggleSelection = useCallback((id: number) => {
        const newSelection = new Set(selectedIds);
        if (newSelection.has(id)) {
            newSelection.delete(id);
        } else {
            newSelection.add(id);
        }
        setSelectedIds(newSelection);
        if (onSelectionChange) {
            onSelectionChange(Array.from(newSelection));
        }
    }, [selectedIds, onSelectionChange]);

    const clearSelection = useCallback(() => {
        setSelectedIds(new Set());
        if (onSelectionChange) {
            onSelectionChange([]);
        }
    }, [onSelectionChange]);

    const setSelection = useCallback((ids: number[]) => {
        const newSelection = new Set(ids);
        setSelectedIds(newSelection);
        if (onSelectionChange) {
            onSelectionChange(ids);
        }
    }, [onSelectionChange]);

    return {
        selectedIds: Array.from(selectedIds),
        selectRows,
        toggleSelection,
        clearSelection,
        setSelection,
        isSelecting,
        error
    };
};
