import React from 'react';
import { Modal, Form, Input, DatePicker, Button, message, Space } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useCreateBooking } from './hooks';
import type { createBookingServiceParams } from './bookingService.param';
import type { GameRoomResponseDto } from '../gamerooms/gameroomService.param';

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  gameRoom: GameRoomResponseDto | null;
  selectedStartDate?: Date;
  selectedEndDate?: Date;
  onBookingCreated?: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({
  open,
  onClose,
  gameRoom,
  selectedStartDate,
  selectedEndDate,
  onBookingCreated,
}) => {
  const [form] = Form.useForm();
  const { createBooking, loading } = useCreateBooking();

  const handleSubmit = async (values: {
    titulo: string;
    descripcion?: string;
    fecha_inicio: Dayjs;
    fecha_fin: Dayjs;
    usuario?: string;
  }) => {
    if (!gameRoom) {
      message.error('No se ha seleccionado una sala');
      return;
    }

    try {
      const bookingData: createBookingServiceParams = {
        game_room_id: gameRoom.id,
        titulo: values.titulo,
        descripcion: values.descripcion || null,
        fecha_inicio: values.fecha_inicio.toISOString(),
        fecha_fin: values.fecha_fin.toISOString(),
        usuario: values.usuario || null,
      };

      await createBooking(bookingData);
      message.success('Reserva creada exitosamente');
      form.resetFields();
      onBookingCreated?.();
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear la reserva';
      message.error(errorMessage);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <>
      <style>{`
        /* Estilos para el Modal - Overlay y máscara */
        .ant-modal-mask {
          background-color: rgba(0, 0, 0, 0.75) !important;
        }
        .ant-modal-wrap {
          background-color: transparent !important;
        }
        /* Estilos para el Modal - Contenedor */
        .ant-modal-content {
          background-color: #2a2a2a !important;
          border: 1px solid #555555 !important;
        }
        .ant-modal-header {
          background-color: #2a2a2a !important;
          border-bottom: 1px solid #555555 !important;
        }
        .ant-modal-title {
          color: #E8E8E8 !important;
        }
        .ant-modal-close {
          color: #BBBBBB !important;
        }
        .ant-modal-close:hover {
          color: #FFFFFF !important;
        }
        .ant-modal-body {
          background-color: #2a2a2a !important;
          color: #E8E8E8 !important;
        }
        .ant-modal-footer {
          background-color: #2a2a2a !important;
          border-top: 1px solid #555555 !important;
        }
        /* Estilos para DatePicker en el modal */
        .ant-picker {
          background-color: #3a3a3a !important;
          border-color: #555555 !important;
          color: #E8E8E8 !important;
        }
        .ant-picker:hover {
          border-color: #777777 !important;
        }
        .ant-picker-focused {
          border-color: #888888 !important;
          box-shadow: 0 0 0 2px rgba(136, 136, 136, 0.2) !important;
        }
        .ant-picker-input > input {
          color: #E8E8E8 !important;
          background-color: transparent !important;
        }
        .ant-picker-input > input::placeholder {
          color: #999999 !important;
        }
        .ant-picker-suffix {
          color: #BBBBBB !important;
        }
        /* Estilos para el panel del DatePicker */
        .ant-picker-dropdown {
          background-color: #2a2a2a !important;
        }
        .ant-picker-panel {
          background-color: #2a2a2a !important;
          border-color: #555555 !important;
        }
        .ant-picker-header {
          border-bottom-color: #555555 !important;
          color: #E8E8E8 !important;
        }
        .ant-picker-content th,
        .ant-picker-content td {
          color: #E8E8E8 !important;
        }
        .ant-picker-cell:hover:not(.ant-picker-cell-disabled) {
          background-color: #3a3a3a !important;
        }
        .ant-picker-cell-selected {
          background-color: #555555 !important;
        }
        /* Estilos para los botones del modal */
        .ant-btn-default {
          background-color: #3a3a3a !important;
          border-color: #555555 !important;
          color: #E8E8E8 !important;
        }
        .ant-btn-default:hover {
          background-color: #4a4a4a !important;
          border-color: #666666 !important;
          color: #FFFFFF !important;
        }
      `}</style>
      <Modal
        title={
          gameRoom
            ? `Crear Reserva - ${gameRoom.nombre}`
            : 'Crear Reserva'
        }
        open={open}
        onCancel={handleCancel}
        footer={null}
        width={600}
        maskStyle={{
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
        }}
        styles={{
          header: {
            backgroundColor: '#2a2a2a',
            borderBottom: '1px solid #555555',
            color: '#E8E8E8',
          },
          body: {
            backgroundColor: '#2a2a2a',
            color: '#E8E8E8',
          },
          footer: {
            padding: '16px 10px',
            backgroundColor: '#2a2a2a',
          },
        }}
        style={{
          backgroundColor: '#2a2a2a',
        }}
      >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        style={{ marginTop: '20px' }}
      >
        <Form.Item
          label={<span style={{ color: '#E8E8E8' }}>Título</span>}
          name="titulo"
          rules={[{ required: true, message: 'Por favor ingresa un título' }]}
        >
          <Input
            placeholder="Ej: Reunión de equipo"
            style={{
              backgroundColor: '#3a3a3a',
              border: '1px solid #555555',
              color: '#E8E8E8',
            }}
          />
        </Form.Item>

        <Form.Item
          label={<span style={{ color: '#E8E8E8' }}>Descripción</span>}
          name="descripcion"
        >
          <Input.TextArea
            rows={3}
            placeholder="Descripción opcional de la reserva"
            style={{
              backgroundColor: '#3a3a3a',
              border: '1px solid #555555',
              color: '#E8E8E8',
            }}
          />
        </Form.Item>

        <Form.Item
          label={<span style={{ color: '#E8E8E8' }}>Fecha y hora de inicio</span>}
          name="fecha_inicio"
          rules={[{ required: true, message: 'Por favor selecciona la fecha de inicio' }]}
          initialValue={selectedStartDate ? dayjs(selectedStartDate) : undefined}
        >
          <DatePicker
            showTime
            format="YYYY-MM-DD HH:mm"
            style={{ width: '100%' }}
            placeholder="Selecciona fecha y hora de inicio"
          />
        </Form.Item>

        <Form.Item
          label={<span style={{ color: '#E8E8E8' }}>Fecha y hora de fin</span>}
          name="fecha_fin"
          rules={[
            { required: true, message: 'Por favor selecciona la fecha de fin' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || !getFieldValue('fecha_inicio')) {
                  return Promise.resolve();
                }
                if (value.isAfter(getFieldValue('fecha_inicio'))) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('La fecha de fin debe ser posterior a la de inicio'));
              },
            }),
          ]}
          initialValue={selectedEndDate ? dayjs(selectedEndDate) : undefined}
        >
          <DatePicker
            showTime
            format="YYYY-MM-DD HH:mm"
            style={{ width: '100%' }}
            placeholder="Selecciona fecha y hora de fin"
          />
        </Form.Item>

        <Form.Item
          label={<span style={{ color: '#E8E8E8' }}>Usuario</span>}
          name="usuario"
        >
          <Input
            placeholder="Nombre del usuario (opcional)"
            style={{
              backgroundColor: '#3a3a3a',
              border: '1px solid #555555',
              color: '#E8E8E8',
            }}
          />
        </Form.Item>

        <Form.Item>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={handleCancel}>
              Cancelar
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{
                backgroundColor: '#696FC7',
                borderColor: '#696FC7',
              }}
            >
              Crear Reserva
            </Button>
          </Space>
        </Form.Item>
      </Form>
      </Modal>
    </>
  );
};

export default BookingModal;
