import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";

export default function Support() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:9092/auth/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const message = await response.text();

      if (response.ok) {
        toast.success(message, {
          style: {
            backgroundColor: "#16a34a",
            color: "white",
          },
        });
      } else {
        toast.error(message, {
          style: {
            backgroundColor: "#dc2626",
            color: "white",
          },
        });
      }
    } catch (error: any) {
      toast.error('Error sending support request: ' + error.message, {
        style: {
          backgroundColor: "#dc2626",
          color: "white",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-primary">Support - IntelliQuest</h1>
      <Tabs defaultValue="faq">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="faq" className="bg-transparent text-muted-foreground data-[state=active]:!bg-background data-[state=active]:!text-foreground">FAQs</TabsTrigger>
          <TabsTrigger value="contact" className="bg-transparent text-muted-foreground data-[state=active]:!bg-background data-[state=active]:!text-foreground">Contact Us</TabsTrigger>
          <TabsTrigger value="status" className="bg-transparent text-muted-foreground data-[state=active]:!bg-background data-[state=active]:!text-foreground">System Status</TabsTrigger>
        </TabsList>

        <TabsContent value="faq">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[300px] overflow-scroll scrollbar-hidden">
              <div>
                <strong>How do I upload a course?</strong>
                <p>Navigate to your Instructor Dashboard and click "Create Course." Fill out the course details and upload your content.</p>
              </div>
              <Separator />
              <div>
                <strong>When do I get paid?</strong>
                <p>Payouts are processed monthly. You can view your earnings in the Billing section.</p>
              </div>
              <Separator />
              <div>
                <strong>Can I edit a course after publishing?</strong>
                <p>Yes, go to your Courses tab and select the course to edit its content or settings.</p>
              </div>
              <Separator />
              <div>
                <strong>How do I reset my password?</strong>
                <p>If you've forgotten your password, click on the 'Forgot Password' link on the login page, and follow the instructions to reset it via email.</p>
              </div>
              <Separator />
              <div>
                <strong>Can I track my course progress?</strong>
                <p>Yes, you can track your progress through the 'My Courses' tab. Your progress is updated automatically as you complete modules and assignments.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle>Contact Support</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input name="name" value={formData.name} onChange={handleChange} placeholder="Your Name" required />
                <Input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Your Email" required />
                <Input name="subject" value={formData.subject} onChange={handleChange} placeholder="Subject" required />
                <Textarea name="message" value={formData.message} onChange={handleChange} placeholder="Your Message" rows={4} required />
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <div className="flex items-center gap-2">
                      Sending
                      <div className="loader" />
                    </div>
                  ) : (
                    "Submit"
                  )}
                </Button>

              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-row gap-2 items-center justify-start">
                <span className="text-green-600 font-medium">All systems are fully operational.</span>
                <CircleCheck />
              </div>
              <p className="text-sm text-muted-foreground mt-[1.5rem]">
                Running <span className="font-semibold">IntelliQuest Platform v1.3.0 (Stable)</span> — Last updated on Apr 30, 2025.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
