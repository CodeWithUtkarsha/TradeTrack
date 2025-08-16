import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ExternalLink, 
  Mail, 
  CheckCircle, 
  Copy, 
  Settings,
  Zap,
  Shield,
  Globe
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EMAIL_SETUP_GUIDE } from "@/lib/emailService";

export default function EmailSetup() {
  const [testEmail, setTestEmail] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Code copied to clipboard",
    });
  };

  const testEmailService = async () => {
    if (!testEmail) {
      toast({
        title: "Error",
        description: "Please enter an email address to test",
        variant: "destructive",
      });
      return;
    }

    setIsTesting(true);
    try {
      // Import the email service dynamically
      const { emailService } = await import("@/lib/emailService");
      const success = await emailService.sendPasswordResetEmail(testEmail, "Test User");
      
      if (success) {
        toast({
          title: "Test email sent!",
          description: "Check the console (F12) for the reset link in demo mode.",
        });
      } else {
        toast({
          title: "Test failed",
          description: "Could not send test email. Check the setup.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to test email service",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-navy text-white pt-20">
      <div className="floating-elements"></div>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">Email Service Setup</h1>
          <p className="text-gray-300">Configure email sending for password resets and notifications</p>
        </div>

        {/* Quick Test */}
        <Card className="mb-6 glass-morphism border-gray-600">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-400" />
              Quick Test
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                type="email"
                placeholder="Enter your email to test"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="input-override"
              />
              <Button
                onClick={testEmailService}
                disabled={isTesting}
                className="btn-primary"
              >
                {isTesting ? "Testing..." : "Test Email"}
              </Button>
            </div>
            <p className="text-sm text-gray-400 mt-2">
              This will test the current email configuration. In demo mode, check the browser console for the reset link.
            </p>
          </CardContent>
        </Card>

        {/* Setup Options */}
        <Tabs defaultValue="web3forms" className="w-full">
          <TabsList className="grid w-full grid-cols-3 glass-morphism">
            <TabsTrigger value="web3forms" className="data-[state=active]:bg-electric-blue">
              Web3Forms
              <Badge className="ml-2 bg-green-600">Recommended</Badge>
            </TabsTrigger>
            <TabsTrigger value="formsubmit" className="data-[state=active]:bg-electric-blue">
              FormSubmit
            </TabsTrigger>
            <TabsTrigger value="emailjs" className="data-[state=active]:bg-electric-blue">
              EmailJS
            </TabsTrigger>
          </TabsList>

          {/* Web3Forms Setup */}
          <TabsContent value="web3forms">
            <Card className="glass-morphism border-gray-600">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-400" />
                  Web3Forms Setup
                  <Badge className="bg-green-600">Free Forever</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Advantages:</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      {EMAIL_SETUP_GUIDE.web3forms.pros.map((pro, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-400" />
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Setup Steps:</h4>
                    <ol className="text-sm text-gray-300 space-y-1">
                      {EMAIL_SETUP_GUIDE.web3forms.steps.map((step, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-electric-blue font-mono text-xs mt-0.5">
                            {index + 1}.
                          </span>
                          {step.substring(2)}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
                
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold">Code to update:</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard("formData.append('access_key', 'YOUR_WEB3FORMS_ACCESS_KEY');")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <code className="text-sm text-electric-blue">
                    formData.append('access_key', 'YOUR_WEB3FORMS_ACCESS_KEY');
                  </code>
                </div>

                <Button asChild className="btn-primary">
                  <a href={EMAIL_SETUP_GUIDE.web3forms.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Go to Web3Forms
                  </a>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* FormSubmit Setup */}
          <TabsContent value="formsubmit">
            <Card className="glass-morphism border-gray-600">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-purple-400" />
                  FormSubmit Setup
                  <Badge className="bg-purple-600">Simple</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Advantages:</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      {EMAIL_SETUP_GUIDE.formsubmit.pros.map((pro, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-400" />
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Setup Steps:</h4>
                    <ol className="text-sm text-gray-300 space-y-1">
                      {EMAIL_SETUP_GUIDE.formsubmit.steps.map((step, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-electric-blue font-mono text-xs mt-0.5">
                            {index + 1}.
                          </span>
                          {step.substring(2)}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>

                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold">Code to update:</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard("const response = await fetch('https://formsubmit.co/your-email@example.com', {")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <code className="text-sm text-electric-blue">
                    'https://formsubmit.co/your-email@example.com'
                  </code>
                </div>

                <Button asChild className="btn-primary">
                  <a href={EMAIL_SETUP_GUIDE.formsubmit.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Go to FormSubmit
                  </a>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* EmailJS Setup */}
          <TabsContent value="emailjs">
            <Card className="glass-morphism border-gray-600">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-orange-400" />
                  EmailJS Setup
                  <Badge className="bg-orange-600">Advanced</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Advantages:</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      {EMAIL_SETUP_GUIDE.emailjs.pros.map((pro, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-400" />
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Setup Steps:</h4>
                    <ol className="text-sm text-gray-300 space-y-1">
                      {EMAIL_SETUP_GUIDE.emailjs.steps.map((step, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-electric-blue font-mono text-xs mt-0.5">
                            {index + 1}.
                          </span>
                          {step.substring(2)}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>

                <div className="bg-gray-800 p-4 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">Configuration variables:</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(`const EMAIL_SERVICE_ID = 'your_service_id';
const EMAIL_TEMPLATE_ID = 'your_template_id';
const EMAIL_PUBLIC_KEY = 'your_public_key';`)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <code className="text-sm text-electric-blue block">
                    const EMAIL_SERVICE_ID = 'your_service_id';<br />
                    const EMAIL_TEMPLATE_ID = 'your_template_id';<br />
                    const EMAIL_PUBLIC_KEY = 'your_public_key';
                  </code>
                </div>

                <Button asChild className="btn-primary">
                  <a href={EMAIL_SETUP_GUIDE.emailjs.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Go to EmailJS
                  </a>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Current Status */}
        <Card className="mt-6 glass-morphism border-gray-600">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-400" />
              Current Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Email Service</span>
                <Badge className="bg-yellow-600">Demo Mode</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Password Reset</span>
                <Badge className="bg-green-600">Working</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Token Validation</span>
                <Badge className="bg-green-600">Working</Badge>
              </div>
            </div>
            <p className="text-sm text-gray-400 mt-4">
              The system is currently in demo mode. Reset links are logged to the browser console. 
              Configure one of the email services above to send real emails.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
