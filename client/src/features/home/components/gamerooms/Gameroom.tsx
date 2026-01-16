import React, { useState, useMemo } from 'react';
import { HeartOutlined, CalendarOutlined, ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { Avatar, Button, Card, Flex, Spin, Alert, Pagination } from 'antd';
import type { CardMetaProps, CardProps } from 'antd';
import { createStyles } from 'antd-style';
import { useGamerooms } from './hooks';

const { Meta } = Card;

const useStyles = createStyles(({ token }) => ({
  root: {
    width: 500,
    height: '50%',            // 1. Ocupa toda la altura disponible en la fila
    display: 'flex',           // 2. Convierte la tarjeta en un contenedor flexible
    flexDirection: 'column',
    backgroundColor: '#1a1a1a',
    borderRadius: token.borderRadius,
    boxShadow: '0 4px 12px rgba(169, 36, 36, 0.24)',
    border: '1px solid #333333',
    transition: 'all 0.3s ease',
    '&:hover': {
      boxShadow: '0 6px 16px rgba(105, 111, 199, 0.4)',
      borderColor: '#696FC7',
      transform: 'translateY(-2px)',
    },
  },
  header: {
    borderBottom: '1px solid #333333',
    paddingBottom: 8,
  },
  body: {
    paddingTop: 0,
    backgroundColor: '#1a1a1a',
  },
}));



const stylesCardFn: CardProps['styles'] = (info) => {
  if (info.props.variant === 'outlined') {
    return {
      root: {
        borderColor: '#696FC7',
        boxShadow: '0 4px 12px rgba(105, 111, 199, 0.3)',
        borderRadius: 8,
        backgroundColor: '#1f1f1f',
      },
      extra: {
        color: '#A7AAE1',
      },
      title: {
        fontSize: 16,
        fontWeight: 500,
        color: '#E8E8E8',
      },
      body: {
        backgroundColor: '#1a1a1a',
        color: '#E8E8E8',
      },
    } satisfies CardProps['styles'];
  }
  return {
    root: {
      backgroundColor: '#1f1f1f',
      borderColor: '#333333',
    },
    title: {
      color: '#E8E8E8',
    },
    body: {
      backgroundColor: '#1a1a1a',
      color: '#E8E8E8',
    },
  };
};

const stylesCardMeta: CardMetaProps['styles'] = {
  title: {
    color: '#E8E8E8',
    fontSize: 14,
    fontWeight: 600,
  },
  description: {
    color: '#B0B0B0',
    fontSize: 13,
  },
};

const actions = [
  <HeartOutlined key="heart" style={{ color: '#ff6b6b', fontSize: '16px' }} />,
  <CalendarOutlined key="reservar" style={{ color: '#4ecdc4', fontSize: '16px' }} />,
  
];

const ITEMS_PER_PAGE = 2; // Número de salas por página

interface GameroomProps {
  onReserveClick?: (gameRoomId: number) => void;
}

const App: React.FC<GameroomProps> = ({ onReserveClick }) => {
  const { styles: classNames } = useStyles();
  const { gamerooms, loading, error } = useGamerooms();
  const [currentPage, setCurrentPage] = useState(1);

  const sharedCardProps: CardProps = {
    classNames,
    actions,
  };


  const paginatedGamerooms = useMemo(() => {
    if (gamerooms.length <= ITEMS_PER_PAGE) {
      return gamerooms; // No hay necesidad de paginación si hay 2 o menos salas
    }
    
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return gamerooms.slice(startIndex, endIndex);
  }, [gamerooms, currentPage]);


  const totalPages = useMemo(() => {
    return Math.ceil(gamerooms.length / ITEMS_PER_PAGE);
  }, [gamerooms.length]);

  
  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [gamerooms.length, totalPages, currentPage]);

  if (loading) {
    return (
      <Flex gap="middle" justify="center" align="center" style={{ minHeight: 200 }}>
        <Spin size="large" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error al cargar las salas de juegos"
        description={error}
        type="error"
        showIcon
        style={{
          backgroundColor: '#2a1a1a',
          border: '1px solid #ff4d4f',
          color: '#ffccc7',
        }}
      />
    );
  }

  if (gamerooms.length === 0) {
    return (
      <Alert
        message="No hay salas de juegos disponibles"
        description="No se encontraron salas de juegos en el sistema."
        type="info"
        showIcon
        style={{
          backgroundColor: '#1a1a2a',
          border: '1px solid #696FC7',
          color: '#E8E8E8',
        }}
      />
    );
  }

  return (
    <Flex vertical gap="middle" style={{ backgroundColor: '#0f0f0f', padding: '20px', minHeight: '100vh' }}>
      <Flex 
        gap="middle" 
        wrap="wrap" 
        style={{ 
          justifyContent: 'center',
          width: '100%',
          maxWidth: '680px', // Ancho fijo: 2 cards (300px + gap + 300px + padding)
          margin: '0 auto',
        }}
      >
        {paginatedGamerooms.map((gameroom) => {
          const sharedCardMetaProps: CardMetaProps = {
            avatar: <Avatar src="https://api.dicebear.com/7.x/miniavs/svg?seed=3" />,
            description: `Capacidad: ${gameroom.capacidad} personas | Precio: ${gameroom.precio ? `€${gameroom.precio}` : 'Gratis'}`,
          };

          return (
            <Card
              key={gameroom.slug}
              {...sharedCardProps}
              title={gameroom.nombre}
              styles={stylesCardFn}
              extra={
                <Button 
                  type="link" 
                  styles={{ 
                    root: { 
                      color: '#A7AAE1',
                      borderRadius: '5px',
                      border: '1px solid #696FC7',
                      padding: '5px 10px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                    } 
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#696FC7';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#A7AAE1';
                  }}
                  onClick={() => onReserveClick?.(gameroom.id)}
                >
                  Reservar Sala
                </Button>
              }
            >
              <Meta {...sharedCardMetaProps} styles={stylesCardMeta} title={gameroom.nombre} />
            </Card>
          );
        })}
      </Flex>

      {/* Paginación - Solo se muestra si hay más de 2 salas */}
      {gamerooms.length > ITEMS_PER_PAGE && (
        <Flex justify="center" style={{ marginTop: '30px', padding: '20px 0' }}>
          <Pagination
            current={currentPage}
            total={gamerooms.length}
            pageSize={ITEMS_PER_PAGE}
            onChange={(page) => setCurrentPage(page)}
            showSizeChanger={false}
            showQuickJumper={false}
            
            style={{
              color: '#E8E8E8',
            }}
            itemRender={(page, type, originalElement) => {
              if (type === 'prev') {
                return (
                  <Button
                    type="text"
                    style={{
                      color: currentPage === 1 ? '#666' : '#A7AAE1',
                      border: '1px solid #333333',
                      backgroundColor: '#1a1a1a',
                      marginRight: '8px',
                    }}
                    disabled={currentPage === 1}
                  >
                    <ArrowLeftOutlined></ArrowLeftOutlined>
                  </Button>
                );
              }
              if (type === 'next') {
                return (
                  <Button
                    type="text"
                    style={{
                      color: currentPage === totalPages ? '#666' : '#A7AAE1',
                      border: '1px solid #333333',
                      backgroundColor: '#1a1a1a',
                      marginLeft: '8px',
                    }}
                    disabled={currentPage === totalPages}
                  >
                    <ArrowRightOutlined></ArrowRightOutlined>
                  </Button>
                );
              }
              if (type === 'page') {
                return (
                  <Button
                    type={currentPage === page ? 'primary' : 'text'}
                    style={{
                      color: currentPage === page ? '#E8E8E8' : '#A7AAE1',
                      border: '1px solid #333333',
                      backgroundColor: currentPage === page ? '#696FC7' : '#1a1a1a',
                      margin: '0 4px',
                    }}
                  >
                    {page}
                  </Button>
                );
              }
              return originalElement;
            }}
          />
        </Flex>
      )}
    </Flex>
  );
};

export default App;