"use client";

import { useState, useEffect } from "react";
import { User, Mail, CreditCard, Loader2, Check, Save } from "lucide-react";
import { toast, Toaster } from "sonner";
import Image from "next/image";

const STUDENT_AVATARS = [
  "avatar-1",
  "avatar-2",
  "avatar-3",
  "avatar-4",
  "avatar-5",
  "avatar-6",
];

interface UserProfile {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  dni: string | null;
  avatarId: string | null;
  role: string;
}

interface UserSettingsFormProps {
  isAdmin?: boolean;
}

export default function UserSettingsForm({ isAdmin = false }: UserSettingsFormProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [email, setEmail] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch("/api/user/profile");
        if (response.ok) {
          const data = await response.json();
          setProfile(data.user);
          setEmail(data.user.email);
          setSelectedAvatar(data.user.avatarId);
        }
      } catch (error) {
        toast.error("Error al cargar el perfil");
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      const emailChanged = email !== profile.email;
      const avatarChanged = selectedAvatar !== profile.avatarId;
      setHasChanges(emailChanged || avatarChanged);
    }
  }, [email, selectedAvatar, profile]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, avatarId: selectedAvatar }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Error al guardar");
        return;
      }

      setProfile(data.user);
      setHasChanges(false);
      toast.success("Perfil actualizado correctamente");
    } catch (error) {
      toast.error("Error al guardar el perfil");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-yellow-600 animate-spin" />
      </div>
    );
  }

  const availableAvatars = isAdmin 
    ? [...STUDENT_AVATARS, "avatar-admin"] 
    : STUDENT_AVATARS;

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-10">
      <Toaster richColors />

      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-gray-800 tracking-tight">
          Ajustes de Cuenta
        </h1>
        <p className="text-gray-400 font-medium">
          Personaliza tu perfil y preferencias.
        </p>
      </div>

      <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-10">
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-yellow-50 rounded-2xl text-yellow-600">
              <User size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Información Personal</h2>
              <p className="text-sm text-gray-400">Datos de tu cuenta</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-wider">
                Nombre
              </label>
              <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-700 font-medium">
                {profile?.firstName || "-"}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-wider">
                Apellidos
              </label>
              <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-700 font-medium">
                {profile?.lastName || "-"}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-wider">
              <CreditCard size={12} className="inline mr-1" />
              DNI
            </label>
            <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-700 font-medium">
              {profile?.dni || "No disponible"}
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-100 space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
              <Mail size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Email</h2>
              <p className="text-sm text-gray-400">Tu dirección de correo electrónico</p>
            </div>
          </div>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none transition text-gray-700"
            placeholder="tu@email.com"
          />
        </div>

        <div className="pt-8 border-t border-gray-100 space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-purple-50 rounded-2xl text-purple-600">
              <User size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Avatar</h2>
              <p className="text-sm text-gray-400">Elige tu imagen de perfil</p>
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            {availableAvatars.map((avatarId) => (
              <button
                key={avatarId}
                onClick={() => setSelectedAvatar(avatarId)}
                className={`relative aspect-square rounded-2xl overflow-hidden border-4 transition-all hover:scale-105 ${
                  selectedAvatar === avatarId
                    ? "border-yellow-500 shadow-lg shadow-yellow-100"
                    : "border-transparent hover:border-gray-200"
                }`}
              >
                <Image
                  src={`/avatars/${avatarId}.webp`}
                  alt={avatarId}
                  fill
                  className="object-cover"
                />
                {selectedAvatar === avatarId && (
                  <div className="absolute inset-0 bg-yellow-500/20 flex items-center justify-center">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                      <Check size={18} className="text-white" />
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={isSaving || !hasChanges}
        className="w-full bg-[#d4af37] text-white p-5 rounded-2xl font-black text-lg hover:bg-[#b8962e] transition shadow-lg shadow-yellow-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
      >
        {isSaving ? (
          <Loader2 className="animate-spin" size={20} />
        ) : (
          <Save size={20} />
        )}
        {isSaving ? "Guardando..." : "Guardar Cambios"}
      </button>
    </div>
  );
}
