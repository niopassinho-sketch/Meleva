import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

// --- INICIO DA ALTERAÇÃO ---
export function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Tipo de usuário
  const [role, setRole] = useState<'passageiro' | 'motorista'>('passageiro');

  // Dados Básicos
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    email: '',
    password: '',
    data_nascimento: '',
    sexo: '',
    cnh: '', // Apenas motorista
  });

  // Documento
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  // Veículo (Apenas motorista)
  const [vehicleData, setVehicleData] = useState({
    marca: '',
    modelo: '',
    placa: '',
    cor: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleVehicleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVehicleData({ ...vehicleData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDocumentFile(e.target.files[0]);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhotoFile(e.target.files[0]);
    }
  };

  const uploadPhoto = async (userId: string): Promise<string | null> => {
    if (!photoFile) return null;

    // Redimensionar imagem
    const img = new Image();
    img.src = URL.createObjectURL(photoFile);
    await new Promise((resolve) => (img.onload = resolve));

    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(img, 0, 0, 400, 400);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/webp', 0.8)
    );

    if (!blob) throw new Error('Erro ao redimensionar imagem');

    const filePath = `${userId}/profile.webp`;

    const { error: uploadError } = await supabase.storage
      .from('profiles')
      .upload(filePath, blob, { upsert: true });

    if (uploadError) {
      throw new Error('Erro ao fazer upload da foto: ' + uploadError.message);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('profiles')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const uploadDocument = async (userId: string): Promise<string | null> => {
    if (!documentFile) return null;

    const fileExt = documentFile.name.split('.').pop();
    const fileName = `${userId}-${Math.random()}.${fileExt}`;
    const filePath = `${role}s/${fileName}`;

// --- INICIO DA ALTERAÇÃO ---
    const { error: uploadError, data } = await supabase.storage
      .from('documents')
      .upload(filePath, documentFile);

    if (uploadError) {
      throw new Error('Erro ao fazer upload do documento: ' + uploadError.message);
    }
// --- FIM DA ALTERAÇÃO ---

    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Criar usuário no Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.nome,
            cpf: formData.cpf,
            data_nasc: formData.data_nascimento,
            sexo: formData.sexo,
            user_type: role === 'motorista' ? 'driver' : 'passenger',
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user || !authData.session) throw new Error('Erro ao criar usuário ou sessão');

      // 1.1 Garantir que a sessão está definida
      await supabase.auth.setSession(authData.session);

      // Delay de segurança para a trigger handle_new_user terminar
      await new Promise(resolve => setTimeout(resolve, 1000));

      const userId = authData.user.id;

      // 2. Upload do Documento (CNH ou RG) e Foto
      const documentUrl = await uploadDocument(userId);
      const photoUrl = await uploadPhoto(userId);

      // 3. Inserir ou Atualizar na tabela específica
      if (formData.sexo !== 'M' && formData.sexo !== 'F') {
        throw new Error('Por favor, selecione Masculino (M) ou Feminino (F).');
      }

      if (role === 'motorista') {
        const { error: driverError, data: driverData } = await supabase.from('motoristas').upsert({
          id: userId,
          name: formData.nome,
          email: formData.email,
          cpf: formData.cpf,
          data_nasc: formData.data_nascimento,
          sexo: formData.sexo,
          cnh: formData.cnh,
          document_url: documentUrl,
          validation_status: 'PENDING',
          photo_url: photoUrl,
          facial_biometrics_key: null,
          background_check_id: null,
        } as any);
        if (driverError) {
          console.error('Erro detalhado ao inserir motorista:', driverError);
          if (driverError.code === '406') {
            throw new Error('Sua conta está sendo preparada, aguarde um instante...');
          }
          throw new Error('Erro ao salvar dados do motorista: ' + driverError.message);
        }

        // 4. Cadastrar Veículo
        const { error: vehicleError, data: vehicleDataResult } = await supabase.from('vehicles').upsert({
          driver_id: userId,
          brand: vehicleData.marca,
          model: vehicleData.modelo,
          plate: vehicleData.placa,
          color: vehicleData.cor,
        } as any);
        if (vehicleError) {
          console.error('Erro detalhado ao inserir veículo:', vehicleError);
          throw new Error('Erro ao salvar dados do veículo: ' + vehicleError.message);
        }

      } else {
        console.log('Tentando inserir passageiro:', { id: userId, name: formData.nome });
        const { error: passengerError, data: passengerData } = await supabase.from('passageiros').upsert({
          id: userId,
          name: formData.nome,
          email: formData.email,
          cpf: formData.cpf,
          data_nasc: formData.data_nascimento,
          sexo: formData.sexo,
          photo_url: photoUrl,
          document_url: documentUrl,
        } as any);
        
        console.log('Resultado inserção passageiro:', { passengerError, passengerData });
        
        if (passengerError) {
          console.error('Erro detalhado ao inserir passageiro:', passengerError);
          if (passengerError.code === '406') {
            throw new Error('Sua conta está sendo preparada, aguarde um instante...');
          }
          throw new Error('Erro ao salvar dados do passageiro: ' + passengerError.message);
        }
      }

      navigate('/');
    } catch (err: any) {
      console.error('Erro no catch do handleRegister:', err);
      
      if (err.message?.includes('User already registered') || err.message?.includes('already exists')) {
        setError('Este e-mail já está em uso. Por favor, faça login ou recupere sua senha.');
      } else {
        setError(err.message || 'Erro ao realizar cadastro');
      }
    } finally {
// --- FIM DA ALTERAÇÃO ---
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 py-12">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--color-emerald)]">Cadastro MELEVA</h1>
          <p className="text-[var(--color-anthracite)] mt-2">Crie sua conta para começar</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-[var(--color-sos)] text-[var(--color-sos)] rounded-xl text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-4 mb-8">
          <Button 
            type="button" 
            variant={role === 'passageiro' ? 'primary' : 'outline'}
            className="flex-1"
            onClick={() => setRole('passageiro')}
          >
            Sou Passageiro
          </Button>
          <Button 
            type="button" 
            variant={role === 'motorista' ? 'primary' : 'outline'}
            className="flex-1"
            onClick={() => setRole('motorista')}
          >
            Sou Motorista
          </Button>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Nome Completo" name="nome" required value={formData.nome} onChange={handleInputChange} />
            <Input label="E-mail" type="email" name="email" required value={formData.email} onChange={handleInputChange} />
            <Input label="CPF" name="cpf" required value={formData.cpf} onChange={handleInputChange} placeholder="000.000.000-00" />
            <Input label="Senha" type="password" name="password" required value={formData.password} onChange={handleInputChange} />
            <Input label="Data de Nascimento" type="date" name="data_nascimento" required value={formData.data_nascimento} onChange={handleInputChange} />
            
            <div className="flex flex-col gap-1 w-full">
              <label className="text-sm font-medium text-[var(--color-anthracite)]">Sexo</label>
              <select 
                name="sexo" 
                required 
                value={formData.sexo} 
                onChange={handleInputChange}
                className="h-[56px] rounded-[12px] border border-gray-300 px-4 bg-white text-[var(--color-anthracite)] outline-none focus:border-[var(--color-emerald)]"
              >
                <option value="">Selecione...</option>
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
              </select>
            </div>
          </div>

          {role === 'motorista' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <h3 className="col-span-full text-lg font-semibold text-[var(--color-anthracite)]">Dados do Motorista</h3>
              <Input label="CNH" name="cnh" required value={formData.cnh} onChange={handleInputChange} />
            </div>
          )}

          <div className="pt-4 border-t">
            <h3 className="text-lg font-semibold text-[var(--color-anthracite)] mb-4">Foto de Perfil</h3>
            <input 
              type="file" 
              accept="image/*" 
              required 
              onChange={handlePhotoChange}
              className="w-full p-4 border-2 border-dashed border-gray-300 rounded-[12px] text-[var(--color-anthracite)]"
            />
          </div>

          <div className="pt-4 border-t">
            <h3 className="text-lg font-semibold text-[var(--color-anthracite)] mb-4">Documento de Identificação (RG ou CNH)</h3>
            <input 
              type="file" 
              accept="image/*,.pdf" 
              required 
              onChange={handleFileChange}
              className="w-full p-4 border-2 border-dashed border-gray-300 rounded-[12px] text-[var(--color-anthracite)]"
            />
          </div>

          {role === 'motorista' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <h3 className="col-span-full text-lg font-semibold text-[var(--color-anthracite)]">Dados do Veículo</h3>
              <Input label="Marca" name="marca" required value={vehicleData.marca} onChange={handleVehicleChange} />
              <Input label="Modelo" name="modelo" required value={vehicleData.modelo} onChange={handleVehicleChange} />
              <Input label="Placa" name="placa" required value={vehicleData.placa} onChange={handleVehicleChange} />
              <Input label="Cor" name="cor" required value={vehicleData.cor} onChange={handleVehicleChange} />
            </div>
          )}

          <Button type="submit" className="w-full mt-8" isLoading={loading}>
            Finalizar Cadastro
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Já tem uma conta?{' '}
          <Link to="/login" className="text-[var(--color-emerald)] font-semibold hover:underline">
            Faça Login
          </Link>
        </div>
      </div>
    </div>
  );
}
// --- FIM DA ALTERAÇÃO ---
