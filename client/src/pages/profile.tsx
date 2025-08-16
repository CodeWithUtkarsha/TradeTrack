import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userSchema, type User } from "@shared/schema";
import { auth } from "@/lib/auth";
import { emailService } from "@/lib/emailService";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  User as UserIcon, 
  Trash2, 
  Eye, 
  EyeOff, 
  Shield, 
  Smartphone,
  Mail,
  Key,
  AlertCircle,
  CheckCircle,
  QrCode,
  ExternalLink
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Create update schema (subset of user schema for updates)
const updateUserSchema = userSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial();

// Password change schema
const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Email reset schema
const emailResetSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type UpdateUser = z.infer<typeof updateUserSchema>;
type PasswordChange = z.infer<typeof passwordChangeSchema>;
type EmailReset = z.infer<typeof emailResetSchema>;

export default function Profile() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [backup2FACodes, setBackup2FACodes] = useState<string[]>([]);
  const [isEnabling2FA, setIsEnabling2FA] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Initialize email service on component mount
  useEffect(() => {
    emailService.init();
  }, []);

  // Get current user
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["currentUser"],
    queryFn: auth.getCurrentUser,
  });

  const form = useForm<UpdateUser>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      preferredBroker: user?.preferredBroker || "",
      experience: user?.experience || "",
      bio: user?.bio || "",
      defaultRisk: user?.defaultRisk || 2.00,
      riskRewardRatio: user?.riskRewardRatio || "1:2",
      currency: user?.currency || "USD",
      emailNotifications: user?.emailNotifications ?? true,
      aiInsights: user?.aiInsights ?? true,
      weeklyReports: user?.weeklyReports ?? false,
      pushNotifications: user?.pushNotifications ?? true,
    },
  });

  const passwordForm = useForm<PasswordChange>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const emailResetForm = useForm<EmailReset>({
    resolver: zodResolver(emailResetSchema),
    defaultValues: {
      email: user?.email || "",
    },
  });

  // Update form when user data loads
  useState(() => {
    if (user) {
      form.reset({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        preferredBroker: user.preferredBroker,
        experience: user.experience,
        bio: user.bio,
        defaultRisk: user.defaultRisk,
        riskRewardRatio: user.riskRewardRatio,
        currency: user.currency,
        emailNotifications: user.emailNotifications,
        aiInsights: user.aiInsights,
        weeklyReports: user.weeklyReports,
        pushNotifications: user.pushNotifications,
      });
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: UpdateUser) => {
      // Mock profile update - in a real app this would call your backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the user data in localStorage
      if (user) {
        const updatedUser = { ...user, ...data, updatedAt: new Date() };
        localStorage.setItem("user_data", JSON.stringify(updatedUser));
        return updatedUser;
      }
      throw new Error("User not found");
    },
    onSuccess: () => {
      toast({
        title: "Profile updated successfully",
        description: "Your profile information has been saved.",
      });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: PasswordChange) => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Mock password validation
      if (data.currentPassword !== "oldpassword123") {
        throw new Error("Current password is incorrect");
      }
      // In real app, send to backend
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Password changed successfully",
        description: "Your password has been updated.",
      });
      passwordForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const sendPasswordResetMutation = useMutation({
    mutationFn: async (data: EmailReset) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Use the improved email service with multiple fallbacks
      const userName = user ? `${user.firstName} ${user.lastName}` : 'User';
      const success = await emailService.sendPasswordResetEmail(data.email, userName);
      
      if (!success) {
        throw new Error("Failed to send password reset email. Please try again.");
      }
      
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Password reset email sent!",
        description: "Check your email inbox (and spam folder) for password reset instructions. The link will expire in 24 hours.",
      });
      setShowPasswordReset(false);
      emailResetForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send email",
        description: error.message + " Please check your email address and try again.",
        variant: "destructive",
      });
    },
  });

  const uploadProfilePictureMutation = useMutation({
    mutationFn: async (file: File) => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Convert file to base64 for backend upload
      const fileDataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
      
      // Upload to backend API
      const updatedUser = await auth.uploadProfilePicture(fileDataUrl);
      return { fileUrl: fileDataUrl, updatedUser };
    },
    onSuccess: ({ fileUrl, updatedUser }) => {
      setProfilePicture(fileUrl);
      // Update the query cache directly with the new user data from backend
      queryClient.setQueryData(["currentUser"], updatedUser);
      toast({
        title: "Profile picture updated",
        description: "Your profile picture has been uploaded successfully.",
      });
      // Force invalidate to ensure all components refresh
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteProfilePictureMutation = useMutation({
    mutationFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Delete from backend API
      const updatedUser = await auth.deleteProfilePicture();
      return updatedUser;
    },
    onSuccess: (updatedUser) => {
      setProfilePicture(null);
      // Update the query cache directly with the new user data from backend
      queryClient.setQueryData(["currentUser"], updatedUser);
      toast({
        title: "Profile picture removed",
        description: "Your profile picture has been deleted.",
      });
      // Invalidate to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const enable2FAMutation = useMutation({
    mutationFn: async (verificationCode: string) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock 2FA verification
      if (verificationCode !== "123456") {
        throw new Error("Invalid verification code");
      }
      
      // Generate mock backup codes
      const backupCodes = Array.from({ length: 8 }, () => 
        Math.random().toString(36).substring(2, 10).toUpperCase()
      );
      
      if (user) {
        const updatedUser = { ...user, twoFactorEnabled: true, updatedAt: new Date() };
        localStorage.setItem("user_data", JSON.stringify(updatedUser));
        return { backupCodes };
      }
      throw new Error("User not found");
    },
    onSuccess: ({ backupCodes }) => {
      setIs2FAEnabled(true);
      setBackup2FACodes(backupCodes);
      setIsEnabling2FA(false);
      toast({
        title: "2FA enabled successfully",
        description: "Two-factor authentication has been enabled for your account.",
      });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UpdateUser) => {
    updateProfileMutation.mutate(data);
  };

  const onPasswordChange = (data: PasswordChange) => {
    changePasswordMutation.mutate(data);
  };

  const onEmailReset = (data: EmailReset) => {
    sendPasswordResetMutation.mutate(data);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "File size must be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "Please select a valid image file",
          variant: "destructive",
        });
        return;
      }
      
      uploadProfilePictureMutation.mutate(file);
    }
  };

  const handleDeleteProfilePicture = () => {
    deleteProfilePictureMutation.mutate();
  };

  const handleEnable2FA = () => {
    setIsEnabling2FA(true);
    // Generate mock QR code URL
    const mockQRCode = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/TradeJournal:${user?.email}?secret=JBSWY3DPEHPK3PXP&issuer=TradeJournal`;
    setQrCodeUrl(mockQRCode);
  };

  const handleVerify2FA = () => {
    if (verificationCode.length === 6) {
      enable2FAMutation.mutate(verificationCode);
    } else {
      toast({
        title: "Error",
        description: "Please enter a 6-digit verification code",
        variant: "destructive",
      });
    }
  };

  const handleDisable2FA = () => {
    setIs2FAEnabled(false);
    if (user) {
      const updatedUser = { ...user, twoFactorEnabled: false, updatedAt: new Date() };
      localStorage.setItem("user_data", JSON.stringify(updatedUser));
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    }
    toast({
      title: "2FA disabled",
      description: "Two-factor authentication has been disabled.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-navy text-white pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-electric-blue"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-navy text-white pt-20">
      <div className="floating-elements"></div>
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Profile Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">Profile Settings</h1>
          <p className="text-gray-300">Manage your account and trading preferences</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Picture & Basic Info */}
          <Card className="glass-morphism border-gray-600">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  {profilePicture || user?.profilePicture ? (
                    <img
                      src={profilePicture || user?.profilePicture}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-2 border-electric-blue"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gradient-to-r from-electric-blue to-cyber-purple rounded-full flex items-center justify-center">
                      <UserIcon className="h-12 w-12 text-white" />
                    </div>
                  )}
                  {(profilePicture || user?.profilePicture) && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute -top-2 -right-2 w-8 h-8 rounded-full p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="glass-morphism border-gray-600">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Profile Picture</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete your profile picture? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="btn-glass">Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteProfilePicture}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={deleteProfilePictureMutation.isPending}
                          >
                            {deleteProfilePictureMutation.isPending ? "Deleting..." : "Delete"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
                <h3 className="text-xl font-semibold mb-2" data-testid="text-user-name">
                  {user?.firstName} {user?.lastName}
                </h3>
                <p className="text-gray-400 mb-4">Trader</p>
                <div className="space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    className="btn-glass w-full"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadProfilePictureMutation.isPending}
                    data-testid="button-change-photo"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploadProfilePictureMutation.isPending ? "Uploading..." : "Change Photo"}
                  </Button>
                  <p className="text-xs text-gray-400">
                    Max file size: 5MB. Supported formats: JPG, PNG, GIF
                  </p>
                </div>
              </div>
              
              <div className="mt-6 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Member Since</span>
                  <span>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Plan</span>
                  <Badge className="bg-electric-blue bg-opacity-20 text-electric-blue" data-testid="text-subscription">
                    {user?.subscription || 'Free'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Broker</span>
                  <span>{user?.preferredBroker || 'Not set'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Settings */}
          <Card className="lg:col-span-2 glass-morphism border-gray-600">
            <CardHeader>
              <CardTitle className="text-xl">Account Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">First Name</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="input-override"
                              data-testid="input-first-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Last Name</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="input-override"
                              data-testid="input-last-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Email</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            className="input-override"
                            data-testid="input-email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="preferredBroker"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Preferred Broker</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                          <FormControl>
                            <SelectTrigger className="input-override" data-testid="select-broker">
                              <SelectValue placeholder="Select broker" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="glass-morphism border-gray-600">
                            <SelectItem value="MetaTrader 4">MetaTrader 4</SelectItem>
                            <SelectItem value="TradingView">TradingView</SelectItem>
                            <SelectItem value="Interactive Brokers">Interactive Brokers</SelectItem>
                            <SelectItem value="TD Ameritrade">TD Ameritrade</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="experience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Trading Experience</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                          <FormControl>
                            <SelectTrigger className="input-override" data-testid="select-experience">
                              <SelectValue placeholder="Select experience level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="glass-morphism border-gray-600">
                            <SelectItem value="Beginner">Beginner (&lt; 1 year)</SelectItem>
                            <SelectItem value="Intermediate">Intermediate (1-3 years)</SelectItem>
                            <SelectItem value="Advanced">Advanced (3-5 years)</SelectItem>
                            <SelectItem value="Expert">Expert (&gt; 5 years)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Bio</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            value={field.value || ""}
                            rows={4}
                            placeholder="Tell us about your trading journey..."
                            className="input-override"
                            data-testid="textarea-bio"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button
                    type="submit"
                    className="btn-primary"
                    disabled={updateProfileMutation.isPending}
                    data-testid="button-update-profile"
                  >
                    {updateProfileMutation.isPending ? "Updating..." : "Update Profile"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Trading Preferences */}
        <Card className="mt-6 glass-morphism border-gray-600">
          <CardHeader>
            <CardTitle className="text-xl">Trading Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Default Risk %</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="2.00"
                  className="input-override"
                  data-testid="input-default-risk"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Preferred R:R Ratio</label>
                <Select defaultValue="1:2">
                  <SelectTrigger className="input-override" data-testid="select-risk-reward">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-morphism border-gray-600">
                    <SelectItem value="1:1">1:1</SelectItem>
                    <SelectItem value="1:1.5">1:1.5</SelectItem>
                    <SelectItem value="1:2">1:2</SelectItem>
                    <SelectItem value="1:3">1:3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Currency</label>
                <Select defaultValue="USD">
                  <SelectTrigger className="input-override" data-testid="select-currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-morphism border-gray-600">
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="CAD">CAD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-4">Notification Preferences</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox id="email-notifications" defaultChecked data-testid="checkbox-email-notifications" />
                  <label htmlFor="email-notifications" className="text-gray-300">
                    Email notifications for trade alerts
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="ai-insights" defaultChecked data-testid="checkbox-ai-insights" />
                  <label htmlFor="ai-insights" className="text-gray-300">
                    AI insights and pattern recognition alerts
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="weekly-reports" data-testid="checkbox-weekly-reports" />
                  <label htmlFor="weekly-reports" className="text-gray-300">
                    Weekly performance summaries
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="push-notifications" defaultChecked data-testid="checkbox-push-notifications" />
                  <label htmlFor="push-notifications" className="text-gray-300">
                    Mobile push notifications
                  </label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="mt-6 glass-morphism border-gray-600">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {/* Password Change Section */}
              <div>
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Change Password
                </h4>
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordChange)} className="space-y-4">
                    <div className="grid md:grid-cols-1 gap-4">
                      <FormField
                        control={passwordForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">Current Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  {...field}
                                  type={showCurrentPassword ? "text" : "password"}
                                  className="input-override pr-10"
                                  data-testid="input-current-password"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                >
                                  {showCurrentPassword ? (
                                    <EyeOff className="h-4 w-4 text-gray-400" />
                                  ) : (
                                    <Eye className="h-4 w-4 text-gray-400" />
                                  )}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">New Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  {...field}
                                  type={showNewPassword ? "text" : "password"}
                                  className="input-override pr-10"
                                  data-testid="input-new-password"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                  onClick={() => setShowNewPassword(!showNewPassword)}
                                >
                                  {showNewPassword ? (
                                    <EyeOff className="h-4 w-4 text-gray-400" />
                                  ) : (
                                    <Eye className="h-4 w-4 text-gray-400" />
                                  )}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={passwordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">Confirm New Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  {...field}
                                  type={showConfirmPassword ? "text" : "password"}
                                  className="input-override pr-10"
                                  data-testid="input-confirm-password"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                  {showConfirmPassword ? (
                                    <EyeOff className="h-4 w-4 text-gray-400" />
                                  ) : (
                                    <Eye className="h-4 w-4 text-gray-400" />
                                  )}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex gap-4">
                      <Button
                        type="submit"
                        className="btn-primary"
                        disabled={changePasswordMutation.isPending}
                        data-testid="button-update-password"
                      >
                        {changePasswordMutation.isPending ? "Updating..." : "Update Password"}
                      </Button>
                      <Dialog open={showPasswordReset} onOpenChange={setShowPasswordReset}>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="btn-glass">
                            <Mail className="h-4 w-4 mr-2" />
                            Send Reset Email
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="glass-morphism border-gray-600">
                          <DialogHeader>
                            <DialogTitle>Send Password Reset Email</DialogTitle>
                            <DialogDescription>
                              We'll send a password reset link to your email address. The link will be valid for 24 hours.
                            </DialogDescription>
                          </DialogHeader>
                          <Form {...emailResetForm}>
                            <form onSubmit={emailResetForm.handleSubmit(onEmailReset)} className="space-y-4">
                              <FormField
                                control={emailResetForm.control}
                                name="email"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Email Address</FormLabel>
                                    <FormControl>
                                      <Input
                                        {...field}
                                        type="email"
                                        className="input-override"
                                        placeholder="Enter your email address"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-3">
                                <p className="text-sm text-blue-300">
                                  📧 <strong>Demo Mode:</strong> In this demo, the reset link will be logged to the browser console. 
                                  Check the console (F12) to see the generated reset link. In a real application, 
                                  this would be sent to your actual email address.
                                </p>
                                <div className="mt-2">
                                  <a 
                                    href="/email-setup" 
                                    target="_blank"
                                    className="text-sm text-electric-blue hover:text-cyber-purple inline-flex items-center gap-1"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    Configure Email Service
                                  </a>
                                </div>
                              </div>
                              <div className="flex gap-4">
                                <Button
                                  type="submit"
                                  className="btn-primary"
                                  disabled={sendPasswordResetMutation.isPending}
                                >
                                  {sendPasswordResetMutation.isPending ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                      Sending...
                                    </>
                                  ) : (
                                    <>
                                      <Mail className="h-4 w-4 mr-2" />
                                      Send Reset Email
                                    </>
                                  )}
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => setShowPasswordReset(false)}
                                  className="btn-glass"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </form>
                          </Form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </form>
                </Form>
              </div>
              
              {/* 2FA Section */}
              <div>
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  Two-Factor Authentication
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-600 rounded-lg">
                    <div>
                      <p className="text-gray-300">Add an extra layer of security to your account</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-gray-400">Status:</span>
                        {is2FAEnabled || user?.twoFactorEnabled ? (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            <span className="text-green-400 text-sm">Enabled</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <AlertCircle className="h-4 w-4 text-yellow-400" />
                            <span className="text-yellow-400 text-sm">Not Enabled</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {is2FAEnabled || user?.twoFactorEnabled ? (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" className="btn-glass text-red-400 border-red-400 hover:bg-red-400/10">
                              Disable 2FA
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="glass-morphism border-gray-600">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Disable Two-Factor Authentication</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to disable 2FA? This will make your account less secure.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="btn-glass">Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleDisable2FA}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Disable 2FA
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      ) : (
                        <Dialog open={isEnabling2FA} onOpenChange={setIsEnabling2FA}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              className="btn-glass" 
                              onClick={handleEnable2FA}
                              data-testid="button-enable-2fa"
                            >
                              Enable 2FA
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="glass-morphism border-gray-600 max-w-md">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <QrCode className="h-5 w-5" />
                                Enable Two-Factor Authentication
                              </DialogTitle>
                              <DialogDescription>
                                Scan the QR code with your authenticator app, then enter the verification code.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              {qrCodeUrl && (
                                <div className="text-center">
                                  <img
                                    src={qrCodeUrl}
                                    alt="2FA QR Code"
                                    className="mx-auto bg-white p-2 rounded-lg"
                                  />
                                  <p className="text-xs text-gray-400 mt-2">
                                    Can't scan? Use this key: JBSWY3DPEHPK3PXP
                                  </p>
                                </div>
                              )}
                              <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                  Verification Code
                                </label>
                                <Input
                                  type="text"
                                  maxLength={6}
                                  placeholder="000000"
                                  value={verificationCode}
                                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                                  className="input-override text-center text-lg tracking-widest"
                                />
                              </div>
                              <div className="flex gap-4">
                                <Button
                                  onClick={handleVerify2FA}
                                  className="btn-primary flex-1"
                                  disabled={enable2FAMutation.isPending || verificationCode.length !== 6}
                                >
                                  {enable2FAMutation.isPending ? "Verifying..." : "Verify & Enable"}
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => setIsEnabling2FA(false)}
                                  className="btn-glass"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </div>
                  
                  {/* Backup Codes Display */}
                  {backup2FACodes.length > 0 && (
                    <div className="p-4 bg-yellow-900/20 border border-yellow-600 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-4 w-4 text-yellow-400" />
                        <h5 className="font-semibold text-yellow-400">Backup Codes</h5>
                      </div>
                      <p className="text-sm text-gray-300 mb-3">
                        Save these backup codes in a secure location. You can use them to access your account if you lose your authenticator device.
                      </p>
                      <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                        {backup2FACodes.map((code, index) => (
                          <div key={index} className="bg-gray-800 p-2 rounded text-center">
                            {code}
                          </div>
                        ))}
                      </div>
                      <Button
                        className="mt-3 btn-glass"
                        onClick={() => setBackup2FACodes([])}
                      >
                        I've Saved These Codes
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
