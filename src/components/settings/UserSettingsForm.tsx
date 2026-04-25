"use client";

import { useState, useEffect } from "react";
import { User, Mail, CreditCard, Loader2, Check, Save, Lock } from "lucide-react";
import Link from 'next/link';
import { toast } from "sonner";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

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
  const { updateUser } = useAuth();
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
      updateUser({ email: data.user.email, avatarId: data.user.avatarId });
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
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  const availableAvatars = isAdmin
    ? [...STUDENT_AVATARS, "avatar-admin"]
    : STUDENT_AVATARS;

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-10">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-slate-50 tracking-tight">
          Ajustes de Cuenta
        </h1>
        <p className="text-slate-400 font-medium">
          Personaliza tu perfil y preferencias.
        </p>
      </div>

      <div className="bg-surface p-10 rounded-[2.5rem] border border-slate-700/50 space-y-10">
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-accent/10 rounded-2xl text-accent">
              <User size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Información Personal</h2>
              <p className="text-sm text-slate-500">Datos de tu cuenta</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">
                Nombre
              </label>
              <div className="px-4 py-3 bg-slate-800 rounded-xl text-slate-300 font-medium">
                {profile?.firstName || "-"}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">
                Apellidos
              </label>
              <div className="px-4 py-3 bg-slate-800 rounded-xl text-slate-300 font-medium">
                {profile?.lastName || "-"}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">
              <CreditCard size={12} className="inline mr-1" />
              DNI
            </label>
            <div className="px-4 py-3 bg-slate-800 rounded-xl text-slate-300 font-medium">
              {profile?.dni || "No disponible"}
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-700/50 space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-accent/10 rounded-2xl text-accent">
              <Mail size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Email</h2>
              <p className="text-sm text-slate-500">Tu dirección de correo electrónico</p>
            </div>
          </div>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl focus:ring-2 focus:ring-accent outline-none transition text-slate-200 placeholder:text-slate-500"
            placeholder="tu@email.com"
          />
        </div>

        <div className="pt-8 border-t border-slate-700/50 space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-brand/20 rounded-2xl text-brand-light">
              <User size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Avatar</h2>
              <p className="text-sm text-slate-500">Elige tu imagen de perfil</p>
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            {availableAvatars.map((avatarId) => (
              <button
                key={avatarId}
                onClick={() => setSelectedAvatar(avatarId)}
                className={`relative aspect-square rounded-2xl overflow-hidden border-4 transition-all hover:scale-105 ${
                  selectedAvatar === avatarId
                    ? "border-accent shadow-lg shadow-accent/20"
                    : "border-transparent hover:border-slate-600"
                }`}
              >
                <Image
                  src={`/avatars/${avatarId}.webp`}
                  alt={avatarId}
                  fill
                  className="object-cover"
                />
                {selectedAvatar === avatarId && (
                  <div className="absolute inset-0 bg-accent/20 flex items-center justify-center">
                    <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                      <Check size={18} className="text-white" />
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-8 border-t border-slate-700/50 space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-red-500/10 rounded-2xl text-red-400">
              <Lock size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Seguridad</h2>
              <p className="text-sm text-slate-500">Gestiona tu contraseña de acceso</p>
            </div>
          </div>
          <Link href="/cambiar-contrasena" className="inline-block">
             <div className="px-6 py-3 bg-surface border border-red-500/20 text-red-400 rounded-xl font-bold hover:bg-red-500/10 transition cursor-pointer">
                 Cambiar Contraseña
             </div>
          </Link>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={isSaving || !hasChanges}
        className="w-full bg-accent text-white p-5 rounded-2xl font-black text-lg hover:bg-accent-light transition shadow-lg shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
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
