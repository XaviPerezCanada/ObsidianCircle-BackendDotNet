import { useState, FormEvent } from 'react';
import { useAuth } from '../hook/useAuth';
import { LoginUseCase } from '../../application/LoginUseCase';
import { RegisterUseCase } from '../../application/RegisterUseCase';
import { AuthMockRepository } from '../../Infraestructure/AuthMockRepository';

const authRepository = new AuthMockRepository();
const loginUseCase = new LoginUseCase(authRepository);
const registerUseCase = new RegisterUseCase(authRepository);

interface RegisterProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export const Register = ({ onSuccess, onSwitchToLogin }: RegisterProps) => {
  const { register, loading, error } = useAuth(loginUseCase, registerUseCase);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return;
    }

    try {
      await register({ name, email, password });
      onSuccess?.();
    } catch (err) {
      // El error ya está manejado en el hook
    }
  };

  return (
    <div style={{
      maxWidth: '400px',
      margin: '50px auto',
      padding: '2rem',
      background: '#fff',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', color: '#333' }}>
        Registrarse
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="name" style={{ display: 'block', marginBottom: '0.5rem', color: '#333' }}>
            Nombre:
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', color: '#333' }}>
            Email:
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem', color: '#333' }}>
            Contraseña:
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '0.5rem', color: '#333' }}>
            Confirmar Contraseña:
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              border: password !== confirmPassword && confirmPassword ? '1px solid #c33' : '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem',
              boxSizing: 'border-box'
            }}
          />
          {password !== confirmPassword && confirmPassword && (
            <p style={{ color: '#c33', fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Las contraseñas no coinciden
            </p>
          )}
        </div>

        {error && (
          <div style={{
            padding: '0.75rem',
            marginBottom: '1rem',
            background: '#fee',
            color: '#c33',
            borderRadius: '4px',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || password !== confirmPassword}
          style={{
            width: '100%',
            padding: '0.75rem',
            background: loading || password !== confirmPassword ? '#ccc' : '#646cff',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            fontSize: '1rem',
            cursor: loading || password !== confirmPassword ? 'not-allowed' : 'pointer',
            marginBottom: '1rem'
          }}
        >
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>

        {onSwitchToLogin && (
          <p style={{ textAlign: 'center', color: '#666', fontSize: '0.9rem' }}>
            ¿Ya tienes cuenta?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              style={{
                background: 'none',
                border: 'none',
                color: '#646cff',
                cursor: 'pointer',
                textDecoration: 'underline',
                fontSize: '0.9rem'
              }}
            >
              Inicia sesión aquí
            </button>
          </p>
        )}
      </form>
    </div>
  );
};
