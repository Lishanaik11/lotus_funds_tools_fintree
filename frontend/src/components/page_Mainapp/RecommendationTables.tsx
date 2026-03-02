import React, { useMemo } from "react";
import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    CircularProgress
} from "@mui/material";

type Props = {
    recommendations: any[];
    loading: boolean;
    onModify: (item: any) => void;
    onExit: (id: string) => void;
    onInitiate: (item: any) => void;
};

const RecommendationTables = React.memo(
    ({ recommendations, loading, onModify, onExit, onInitiate }: Props) => {

        const activeRecommendations = useMemo(
            () => recommendations.filter((item) => item.status === "PUBLISHED"),
            [recommendations]
        );

        const watchlistRecommendations = useMemo(
            () => recommendations.filter((item) => item.status === "DRAFT"),
            [recommendations]
        );

        return (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

                {/* ACTIVE */}
                <Paper sx={{ p: 2, borderRadius: 2 }}>
                    <Typography fontWeight={700} sx={{ fontSize: "0.9rem", mb: 2 }}>
                        Active Recommendations ({activeRecommendations.length})
                    </Typography>

                    {loading ? (
                        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                            <CircularProgress size={24} />
                        </Box>
                    ) : (
                        <TableContainer sx={{ maxHeight: 400 }}>
                            <Table size="small" stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontSize: '0.65rem', fontWeight: 700 }}>
                                            Published Date
                                        </TableCell>
                                        <TableCell sx={{ fontSize: '0.65rem', fontWeight: 700 }}>
                                            Recommendation
                                        </TableCell>
                                        <TableCell align="right" sx={{ fontSize: '0.65rem', fontWeight: 700 }}>
                                            Action
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {activeRecommendations.map((item) => {
                                        const dateObj = new Date(item.created_at);
                                        return (
                                            <TableRow
                                                key={item.id}
                                                sx={{ '&:hover': { backgroundColor: '#fcfcfc' } }}
                                            >
                                                <TableCell sx={{ fontSize: '0.65rem' }}>
                                                    {dateObj.toLocaleDateString()}
                                                </TableCell>

                                                <TableCell>
                                                    <Typography
                                                        sx={{
                                                            fontSize: '0.75rem',
                                                            fontWeight: 700,
                                                            color: item.action === 'BUY' ? '#2e7d32' : '#d32f2f'
                                                        }}
                                                    >
                                                        {item.action} {item.instrument} {item.call_type}
                                                    </Typography>

                                                    <Typography sx={{ fontSize: '0.65rem' }}>
                                                        {item.name} • {item.trade_type}
                                                    </Typography>
                                                </TableCell>

                                                <TableCell align="right">
                                                    <Button size="small" onClick={() => onModify(item)}>
                                                        Modify
                                                    </Button>
                                                    <Button size="small" onClick={() => onExit(item.id)}>
                                                        Exit
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Paper>

                {/* WATCHLIST */}
                <Paper sx={{ p: 2, borderRadius: 2 }}>
                    <Typography fontWeight={700} sx={{ fontSize: "0.9rem", mb: 2 }}>
                        Watchlist ({watchlistRecommendations.length})
                    </Typography>

                    <TableContainer sx={{ maxHeight: 400 }}>
                        <Table size="small" stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontSize: '0.65rem', fontWeight: 700 }}>
                                        Published Date
                                    </TableCell>
                                    <TableCell sx={{ fontSize: '0.65rem', fontWeight: 700 }}>
                                        Recommendation
                                    </TableCell>
                                    <TableCell align="right" sx={{ fontSize: '0.65rem', fontWeight: 700 }}>
                                        Action
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {watchlistRecommendations.map((item) => {
                                    const dateObj = new Date(item.created_at);
                                    return (
                                        <TableRow key={item.id}>
                                            <TableCell sx={{ fontSize: '0.65rem' }}>
                                                {dateObj.toLocaleDateString()}
                                            </TableCell>

                                            <TableCell>
                                                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700 }}>
                                                    {item.action} {item.instrument} {item.call_type}
                                                </Typography>

                                                <Typography sx={{ fontSize: '0.65rem' }}>
                                                    {item.name} • {item.trade_type}
                                                </Typography>
                                            </TableCell>

                                            <TableCell align="right">
                                                <Button
                                                    size="small"
                                                    onClick={() => onInitiate(item)}
                                                    disabled={item.status !== "DRAFT"}
                                                >
                                                    Initiate
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>

            </Box>
        );
    }
);

export default RecommendationTables;