"use client";
import { useState } from "react";
import { Button } from "@/app/ui/button";
import { Input } from "@/app/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/ui/card";
import { Badge } from "@/app/ui/badge";
import { Label } from "@/app/ui/lable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/ui/select";
import { Textarea } from "@/app/ui/textarea";
import { Switch } from "@/app/ui/switch";
import {
  Mail,
  MessageSquare,
  Bell,
  Send,
  Users,
  CheckCircle2,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/ui/table";
import { lusitana } from "@/app/ui/utils/fonts";
import { Lusitana } from "next/font/google";

interface NotificationTemplate {
  id: string;
  name: string;
  type: "email" | "sms";
  trigger: string;
  subject?: string;
  content: string;
  enabled: boolean;
}

interface NotificationLog {
  id: string;
  type: "email" | "sms";
  recipient: string;
  subject: string;
  status: "sent" | "failed" | "pending";
  sentAt: string;
}

const mockTemplates: NotificationTemplate[] = [
  {
    id: "1",
    name: "Booking Confirmation",
    type: "email",
    trigger: "booking_confirmed",
    subject: "Your Booking is Confirmed - {{booking_id}}",
    content:
      "Dear {{customer_name}},\n\nYour booking {{booking_id}} has been confirmed...",
    enabled: true,
  },
  {
    id: "2",
    name: "Booking Reminder",
    type: "sms",
    trigger: "booking_reminder",
    content:
      "Hi {{customer_name}}! Reminder: Your rental starts tomorrow at {{pickup_time}}.",
    enabled: true,
  },
  {
    id: "3",
    name: "Payment Receipt",
    type: "email",
    trigger: "payment_received",
    subject: "Payment Receipt - {{invoice_number}}",
    content:
      "Dear {{customer_name}},\n\nWe have received your payment of ${{amount}}...",
    enabled: true,
  },
  {
    id: "4",
    name: "Return Reminder",
    type: "sms",
    trigger: "return_reminder",
    content:
      "Your rental ends today at {{return_time}}. Please return the vehicle on time.",
    enabled: true,
  },
];

const mockLogs: NotificationLog[] = [
  {
    id: "1",
    type: "email",
    recipient: "john@example.com",
    subject: "Your Booking is Confirmed - BK-2024-001",
    status: "sent",
    sentAt: "2024-02-22 10:30 AM",
  },
  {
    id: "2",
    type: "sms",
    recipient: "+1234567890",
    subject: "Booking Reminder",
    status: "sent",
    sentAt: "2024-02-22 09:15 AM",
  },
  {
    id: "3",
    type: "email",
    recipient: "jane@example.com",
    subject: "Payment Receipt - INV-002",
    status: "sent",
    sentAt: "2024-02-21 03:45 PM",
  },
];

export default function ManageNotifications() {
  const [templates, setTemplates] =
    useState<NotificationTemplate[]>(mockTemplates);
  const [logs] = useState<NotificationLog[]>(mockLogs);
  const [selectedTemplate, setSelectedTemplate] =
    useState<NotificationTemplate | null>(null);

  // Email Settings
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: "smtp.gmail.com",
    smtpPort: "587",
    smtpUser: "notifications@rentcars.com",
    smtpPassword: "••••••••",
    fromName: "RentCars",
    fromEmail: "notifications@rentcars.com",
  });

  // SMS Settings
  const [smsSettings, setSmsSettings] = useState({
    provider: "twilio",
    accountSid: "AC••••••••••••••••••",
    authToken: "••••••••••••••••••••",
    fromNumber: "+1234567890",
  });

  const toggleTemplate = (id: string) => {
    setTemplates(
      templates.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t)),
    );
  };

  const totalSent = logs.filter((l) => l.status === "sent").length;
  const totalFailed = logs.filter((l) => l.status === "failed").length;
  const emailsSent = logs.filter(
    (l) => l.type === "email" && l.status === "sent",
  ).length;
  const smsSent = logs.filter(
    (l) => l.type === "sms" && l.status === "sent",
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`${lusitana.className} text-2xl`}>
          Notifications & Communication
        </h1>
        <p className="text-muted-foreground">
          Manage email, SMS notifications, and communication settings
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
            <CheckCircle2 className="size-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSent}</div>
            <p className="text-xs text-muted-foreground">All notifications</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
            <Mail className="size-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{emailsSent}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SMS Sent</CardTitle>
            <MessageSquare className="size-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{smsSent}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <Bell className="size-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFailed}</div>
            <p className="text-xs text-muted-foreground">Needs attention</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="templates">
        <TabsList className="bg-gray-200 rounded-full">
          <TabsTrigger
            className="data-[state=active]:bg-white data-[state=active]:text-black rounded-full"
            value="templates"
          >
            Templates
          </TabsTrigger>
          <TabsTrigger
            className="data-[state=active]:bg-white data-[state=active]:text-black rounded-full"
            value="settings"
          >
            Settings
          </TabsTrigger>
          <TabsTrigger
            className="data-[state=active]:bg-white data-[state=active]:text-black rounded-full"
            value="logs"
          >
            Notification Logs
          </TabsTrigger>
          <TabsTrigger
            className="data-[state=active]:bg-white data-[state=active]:text-black rounded-full"
            value="send"
          >
            Send Notification
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className={`text-xl ${lusitana.className}`}>
                Notification Templates
              </CardTitle>
              <CardDescription className="text-gray-500">
                Manage automated email and SMS templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="flex items-start justify-between border  border-gray-300 rounded-lg p-4"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 rounded-lg bg-blue-100">
                        {template.type === "email" ? (
                          <Mail className="size-5 text-blue-600" />
                        ) : (
                          <MessageSquare className="size-5 text-green-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{template.name}</h4>
                          <Badge
                            variant="outline"
                            className="border-gray-200 bg-gray-200"
                          >
                            {template.type.toUpperCase()}
                          </Badge>
                        </div>
                        {template.subject && (
                          <p className="text-sm text-muted-foreground mb-2 text-gray-500">
                            Subject: {template.subject}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground line-clamp-2 text-gray-500">
                          {template.content}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2 text-gray-500">
                          Trigger:{" "}
                          <code className="bg-gray-100 px-1 rounded">
                            {template.trigger}
                          </code>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={template.enabled}
                        onCheckedChange={() => toggleTemplate(template.id)}
                        className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-400 [&_[data-slot=switch-thumb]]:bg-white"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedTemplate(template)}
                        className="border-gray-300 hover:bg-gray-200"
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className={`${lusitana.className} text-xl`}>
                Email Settings (SMTP)
              </CardTitle>
              <CardDescription className="text-gray-500">
                Configure email delivery settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>SMTP Host</Label>
                  <Input
                    value={emailSettings.smtpHost}
                    onChange={(e) =>
                      setEmailSettings({
                        ...emailSettings,
                        smtpHost: e.target.value,
                      })
                    }
                    className="border-gray-100 bg-gray-100 focus:border-gray-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label>SMTP Port</Label>
                  <Input
                    value={emailSettings.smtpPort}
                    onChange={(e) =>
                      setEmailSettings({
                        ...emailSettings,
                        smtpPort: e.target.value,
                      })
                    }
                    className="border-gray-100 bg-gray-100 focus:border-gray-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label>SMTP Username</Label>
                  <Input
                    value={emailSettings.smtpUser}
                    onChange={(e) =>
                      setEmailSettings({
                        ...emailSettings,
                        smtpUser: e.target.value,
                      })
                    }
                    className="border-gray-100 bg-gray-100 focus:border-gray-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label>SMTP Password</Label>
                  <Input
                    type="password"
                    value={emailSettings.smtpPassword}
                    onChange={(e) =>
                      setEmailSettings({
                        ...emailSettings,
                        smtpPassword: e.target.value,
                      })
                    }
                    className="border-gray-100 bg-gray-100 focus:border-gray-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label>From Name</Label>
                  <Input
                    value={emailSettings.fromName}
                    onChange={(e) =>
                      setEmailSettings({
                        ...emailSettings,
                        fromName: e.target.value,
                      })
                    }
                    className="border-gray-100 bg-gray-100 focus:border-gray-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label>From Email</Label>
                  <Input
                    value={emailSettings.fromEmail}
                    onChange={(e) =>
                      setEmailSettings({
                        ...emailSettings,
                        fromEmail: e.target.value,
                      })
                    }
                    className="border-gray-100 bg-gray-100 focus:border-gray-500"
                  />
                </div>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Save Email Settings</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className={`${lusitana.className} text-xl`}>SMS Settings</CardTitle>
              <CardDescription className="text-gray-500">Configure SMS gateway (Twilio)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>SMS Provider</Label>
                  <Select
                    value={smsSettings.provider}
                    onValueChange={(value) =>
                      setSmsSettings({ ...smsSettings, provider: value })
                    }
                  >
                    <SelectTrigger className="border-gray-100 bg-gray-100 focus:border-gray-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-none bg-white">
                      <SelectItem value="twilio">Twilio</SelectItem>
                      <SelectItem value="nexmo">Nexmo</SelectItem>
                      <SelectItem value="africas_talking">
                        Africa's Talking
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>From Phone Number</Label>
                  <Input
                    value={smsSettings.fromNumber}
                    onChange={(e) =>
                      setSmsSettings({
                        ...smsSettings,
                        fromNumber: e.target.value,
                      })
                    }
                    className="border-gray-100 bg-gray-100 focus:border-gray-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Account SID</Label>
                  <Input
                    value={smsSettings.accountSid}
                    onChange={(e) =>
                      setSmsSettings({
                        ...smsSettings,
                        accountSid: e.target.value,
                      })
                    }
                    className="border-gray-100 bg-gray-100 focus:border-gray-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Auth Token</Label>
                  <Input
                    type="password"
                    value={smsSettings.authToken}
                    onChange={(e) =>
                      setSmsSettings({
                        ...smsSettings,
                        authToken: e.target.value,
                      })
                    }
                    className="border-gray-100 bg-gray-100 focus:border-gray-500"
                  />
                </div>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Save SMS Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle className={`${lusitana.className} text-xl`}>Notification Logs</CardTitle>
              <CardDescription className="text-gray-500">Recent notification activity</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 border-gray-300">
                    <TableHead>Type</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id} className="border-gray-300 ">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {log.type === "email" ? (
                            <Mail className="size-4 text-blue-600" />
                          ) : (
                            <MessageSquare className="size-4 text-green-600" />
                          )}
                          <span className="uppercase text-xs">{log.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>{log.recipient}</TableCell>
                      <TableCell>{log.subject}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            log.status === "sent"
                              ? "default"
                              : log.status === "failed"
                                ? "destructive"
                                : "secondary"
                          }
                          className={`${log.status === "sent" ? "capitalize bg-green-100 text-green-600" : log.status === "failed" ? "capitalize bg-red-100 text-red-600" : "capitalize bg-gray-100 text-gray-600"}`}
                        >
                          {log.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {log.sentAt}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="send">
          <Card>
            <CardHeader>
              <CardTitle className={`${lusitana.className} text-xl`}>Send Custom Notification</CardTitle>
              <CardDescription className="text-gray-500">
                Send a one-time notification to customers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Notification Type</Label>
                <Select defaultValue="email">
                  <SelectTrigger className="border-gray-100 bg-gray-100 focus:border-gray-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-none bg-white">
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Recipients</Label>
                <Select defaultValue="all">
                  <SelectTrigger className="border-gray-100 bg-gray-100 focus:border-gray-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-none bg-white">
                    <SelectItem value="all">All Customers</SelectItem>
                    <SelectItem value="active">Active Bookings</SelectItem>
                    <SelectItem value="custom">Custom List</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input placeholder="Enter email subject" className="border-gray-100 bg-gray-100 focus:border-gray-500" />
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea placeholder="Enter your message..." rows={6} className="border-gray-100 bg-gray-100 focus:border-gray-500" />
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                <Send className="size-4 mr-2" />
                Send Notification
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
