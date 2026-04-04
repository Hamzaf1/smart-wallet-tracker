import { useState, useRef } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, User, Loader2, Check } from "lucide-react";
import { useProfile, useUpdateProfile, useUploadAvatar } from "@/hooks/useProfile";
import { toast } from "sonner";

interface EditProfileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProfileSheet({ open, onOpenChange }: EditProfileSheetProps) {
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Sync form when sheet opens
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && profile) {
      setDisplayName(profile.display_name || "");
      setPreviewUrl(null);
      setSelectedFile(null);
    }
    onOpenChange(isOpen);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (displayName.trim().length < 2) {
      toast.error("Name must be at least 2 characters");
      return;
    }
    if (displayName.trim().length > 30) {
      toast.error("Name must be under 30 characters");
      return;
    }

    try {
      if (selectedFile) {
        await uploadAvatar.mutateAsync(selectedFile);
      }
      await updateProfile.mutateAsync({ display_name: displayName.trim() });
      toast.success("Profile updated!");
      onOpenChange(false);
    } catch {
      toast.error("Failed to update profile");
    }
  };

  const isLoading = updateProfile.isPending || uploadAvatar.isPending;
  const avatarSrc = previewUrl || profile?.avatar_url || undefined;

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl pb-10">
        <SheetHeader>
          <SheetTitle>Edit Profile</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-primary/20">
                <AvatarImage src={avatarSrc} />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                  <User className="h-10 w-10" />
                </AvatarFallback>
              </Avatar>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg border-2 border-background"
              >
                <Camera className="h-4 w-4 text-primary-foreground" />
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
            <p className="text-xs text-muted-foreground">Tap camera to change photo</p>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              maxLength={30}
            />
            <p className="text-xs text-muted-foreground">{displayName.length}/30 characters</p>
          </div>

          {/* Email (read-only) */}
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={profile?.email || ""} disabled className="opacity-60" />
          </div>

          {/* Save */}
          <Button onClick={handleSave} disabled={isLoading} className="w-full h-12 rounded-xl">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Check className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
