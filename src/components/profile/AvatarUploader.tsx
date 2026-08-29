import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";

export function AvatarUploader({ size = 96 }: { size?: number }) {
  const { user, profile, refreshProfile } = useAuth();
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const initials = (profile?.display_name ?? user?.email ?? "LCU")
    .split(/\s+/).slice(0, 2).map((s) => s[0]).join("").toUpperCase() || "LCU";

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Máximo 2 MB");
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${user.id}/avatar-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, cacheControl: "3600" });
    if (upErr) {
      setUploading(false);
      toast.error(upErr.message);
      return;
    }
    const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
    const { error: updErr } = await supabase
      .from("profiles")
      .update({ avatar_url: pub.publicUrl })
      .eq("id", user.id);
    setUploading(false);
    if (updErr) {
      toast.error(updErr.message);
      return;
    }
    await refreshProfile();
    toast.success(t("profile.uploadAvatar"));
  };

  return (
    <div className="flex items-center gap-3">
      <Avatar style={{ width: size, height: size }} className="ring-2 ring-border">
        <AvatarImage src={profile?.avatar_url ?? undefined} />
        <AvatarFallback className="bg-muted text-base font-semibold tracking-wider text-muted-foreground">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div>
        <input ref={inputRef} type="file" accept="image/*" hidden onChange={handleFile} />
        <Button size="sm" variant="outline" onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Camera className="w-3 h-3 mr-1" />}
          {t("profile.uploadAvatar")}
        </Button>
      </div>
    </div>
  );
}