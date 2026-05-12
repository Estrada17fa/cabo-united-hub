import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { ForgotPasswordForm } from "./ForgotPasswordForm";
import { useTranslation } from "react-i18next";

interface AuthModalProps {
  onSuccess?: () => void;
  loginOnly?: boolean;
  onSignupClick?: () => void;
}

export function AuthModal({ onSuccess, loginOnly, onSignupClick }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [view, setView] = useState<"form" | "forgot">("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, signInWithProvider } = useAuth();
  const { t } = useTranslation();

  const handleOAuth = async (provider: "google" | "apple") => {
    setIsLoading(true);
    const { error } = await signInWithProvider(provider);
    setIsLoading(false);
    if (error) toast.error(error.message ?? "Error");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (mode === "login") {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error(error.message === "Invalid login credentials"
          ? "Correo o contraseña incorrectos"
          : "Error al iniciar sesión");
      } else {
        toast.success("¡Bienvenido de vuelta!");
        onSuccess?.();
      }
    } else {
      if (password.length < 8) {
        toast.error("La contraseña debe tener al menos 8 caracteres");
        setIsLoading(false);
        return;
      }
      const { error } = await signUp(email, password, displayName);
      if (error) {
        toast.error("Error al crear la cuenta: " + error.message);
      } else {
        toast.success("¡Cuenta creada! Revisa tu correo para verificar tu cuenta.");
        onSuccess?.();
      }
    }
    setIsLoading(false);
  };

  if (view === "forgot") {
    return <ForgotPasswordForm onBack={() => setView("form")} />;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => handleOAuth("google")}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 h-10 rounded-lg border border-border bg-card hover:bg-muted text-sm font-medium transition-colors"
        >
          <GoogleIcon className="w-4 h-4" />
          {t("auth.google")}
        </button>
        <button
          type="button"
          onClick={() => handleOAuth("apple")}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 h-10 rounded-lg border border-border bg-card hover:bg-muted text-sm font-medium transition-colors"
        >
          <AppleIcon className="w-4 h-4" />
          {t("auth.apple")}
        </button>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1 h-px bg-border" />
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {t("auth.orContinueWith")}
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {!loginOnly && (
      <div className="flex rounded-xl bg-muted p-1 gap-1">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
            mode === "login"
              ? "bg-primary text-primary-foreground shadow"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Iniciar sesión
        </button>
        <button
          type="button"
          onClick={() => onSignupClick ? onSignupClick() : setMode("signup")}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
            mode === "signup"
              ? "bg-primary text-primary-foreground shadow"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Crear cuenta
        </button>
      </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {mode === "signup" && !loginOnly && (
          <div className="space-y-1.5">
            <Label htmlFor="displayName" className="text-xs text-muted-foreground">Nombre</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Tu nombre"
                required
                maxLength={100}
                className="pl-9 bg-card border-border"
              />
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs text-muted-foreground">Correo electrónico</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              required
              maxLength={255}
              className="pl-9 bg-card border-border"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-xs text-muted-foreground">Contraseña</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === "signup" ? "Mínimo 8 caracteres" : "Tu contraseña"}
              required
              minLength={mode === "signup" ? 8 : 1}
              className="pl-9 pr-10 bg-card border-border"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading
            ? "Cargando..."
            : mode === "login"
              ? "Iniciar sesión"
              : "Crear cuenta"
          }
        </Button>

        {mode === "login" && (
          <button
            type="button"
            onClick={() => setView("forgot")}
            className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("auth.forgotPassword")}
          </button>
        )}
      </form>
    </div>
  );
}

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.75h3.57c2.08-1.92 3.28-4.74 3.28-8.07z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.75c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A10.99 10.99 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.12c-.22-.66-.35-1.36-.35-2.12s.13-1.46.35-2.12V7.04H2.18A10.99 10.99 0 0 0 1 12c0 1.78.43 3.46 1.18 4.96l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.04l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}

function AppleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M16.365 1.43c0 1.14-.42 2.21-1.16 3.05-.86.97-2.27 1.71-3.46 1.6-.16-1.13.42-2.31 1.18-3.07.86-.86 2.34-1.55 3.44-1.58zM20.5 17.27c-.55 1.27-.81 1.84-1.51 2.96-.98 1.55-2.36 3.49-4.07 3.5-1.52.02-1.91-.99-3.97-.97-2.06.02-2.49.99-4.01.97-1.71-.01-3.02-1.76-4-3.31C.5 15.97.21 11.27 2.04 8.7 3.34 6.85 5.4 5.78 7.34 5.78c1.97 0 3.21 1.08 4.84 1.08 1.58 0 2.54-1.08 4.83-1.08 1.74 0 3.59.95 4.9 2.59-4.32 2.36-3.62 8.46-1.41 8.9z" />
    </svg>
  );
}
