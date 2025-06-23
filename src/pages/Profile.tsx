import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, User, Mail, Phone, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/auth-context';
import { userProfileService, UserProfile } from '../services/userProfileService';
import { useNavigate } from 'react-router-dom';

export const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    provincia: '',
    telefono: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    
    loadUserProfile();
  }, [user, navigate]);

  const loadUserProfile = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userProfile = await userProfileService.getUserProfile(user.uid);
      
      if (userProfile) {
        setProfile(userProfile);
        setFormData({
          nombre: userProfile.nombre || '',
          apellido: userProfile.apellido || '',
          correo: userProfile.correo || '',
          provincia: userProfile.provincia || '',
          telefono: userProfile.telefono || ''
        });
      } else {
        // Auto-poblar con datos de Google Auth
        const displayName = user.displayName || '';
        const [nombre = '', apellido = ''] = displayName.split(' ');
        
        setFormData({
          nombre,
          apellido,
          correo: user.email || '',
          provincia: '',
          telefono: user.phoneNumber || ''
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setMessage({ type: 'error', text: 'Error al cargar el perfil' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setMessage(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      setSaving(true);
      
      await userProfileService.saveUserProfile(user.uid, formData);
      
      setMessage({ type: 'success', text: 'Perfil guardado correctamente' });
      
      // Recargar perfil
      await loadUserProfile();
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage({ type: 'error', text: 'Error al guardar el perfil' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const isProfileComplete = userProfileService.isProfileComplete(profile);
  const canMakePurchase = userProfileService.canMakePurchase(profile);

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Mi Perfil
          </CardTitle>
        </CardHeader>
        <CardContent>
          {message && (
            <Alert className={`mb-4 ${message.type === 'success' ? 'border-green-500' : 'border-red-500'}`}>
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}
          
          {!canMakePurchase && (
            <Alert className="mb-4 border-amber-500">
              <AlertDescription>
                ⚠️ Para realizar compras, debes completar al menos tu provincia y teléfono.
              </AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Nombre *
                </Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange('nombre', e.target.value)}
                  placeholder="Tu nombre"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="apellido">
                  Apellido *
                </Label>
                <Input
                  id="apellido"
                  value={formData.apellido}
                  onChange={(e) => handleInputChange('apellido', e.target.value)}
                  placeholder="Tu apellido"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="correo" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Correo electrónico *
              </Label>
              <Input
                id="correo"
                type="email"
                value={formData.correo}
                onChange={(e) => handleInputChange('correo', e.target.value)}
                placeholder="tu@email.com"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="provincia" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Provincia * (Requerido para compras)
              </Label>
              <Input
                id="provincia"
                value={formData.provincia}
                onChange={(e) => handleInputChange('provincia', e.target.value)}
                placeholder="Tu provincia"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="telefono" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Teléfono * (Requerido para compras)
              </Label>
              <Input
                id="telefono"
                value={formData.telefono}
                onChange={(e) => handleInputChange('telefono', e.target.value)}
                placeholder="Tu número de teléfono"
                required
              />
            </div>
            
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={saving}
                className="flex-1"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Perfil
                  </>
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/')}
              >
                Volver
              </Button>
            </div>
          </form>
          
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="font-medium mb-2">Estado del perfil:</h3>
            <div className="space-y-1 text-sm">
              <div className={`flex items-center gap-2 ${isProfileComplete ? 'text-green-600' : 'text-amber-600'}`}>
                <div className={`w-2 h-2 rounded-full ${isProfileComplete ? 'bg-green-500' : 'bg-amber-500'}`} />
                Perfil {isProfileComplete ? 'completo' : 'incompleto'}
              </div>
              <div className={`flex items-center gap-2 ${canMakePurchase ? 'text-green-600' : 'text-red-600'}`}>
                <div className={`w-2 h-2 rounded-full ${canMakePurchase ? 'bg-green-500' : 'bg-red-500'}`} />
                {canMakePurchase ? 'Puede realizar compras' : 'No puede realizar compras'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};