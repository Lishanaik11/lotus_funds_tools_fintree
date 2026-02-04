import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, Card } from '@mui/material';

// Define the interface for your props
interface MenuProps {
  menuType?: string;
  isAdmin?: boolean;
}

const Menu: React.FC<MenuProps> = ({ menuType, isAdmin }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const currentLabels = ['Default Card 1', 'Default Card 2', 'Default Card 3', 'Default Card 4', 'Default Card 5', 'Default Card 6'];

  const handleCardClick = (id: number) => {
    navigate(`${location.pathname}/details/${id}`);
  };

  return (
    <Box sx={{ width: '100%', p: 3, boxSizing: 'border-box' }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#1A2027' }}>
        Menu {isAdmin && "(Admin View)"}
      </Typography>

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', width: '100%' }}>
        {currentLabels.map((label, i) => (
          <Box key={i} sx={{ width: 'calc(33.33% - 16px)', minWidth: '300px' }}>
            <Card 
              sx={{ borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', cursor: 'pointer' }}
              onClick={() => handleCardClick(i)}
            >
              <Box sx={{ 
                height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
                bgcolor: i % 3 === 0 ? '#e3f2fd' : i % 3 === 1 ? '#f3e5f5' : '#e8f5e9',
                p: 2 
              }}>
                <Typography variant="h6">{label}</Typography>
              </Box>
            </Card>
          </Box>
        ))}
      </Box>
    </Box>
    
  );
};

export default Menu;