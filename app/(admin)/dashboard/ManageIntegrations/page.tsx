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
import { Switch } from "@/app/ui/switch";
import {
  CreditCard,
  MessageSquare,
  DollarSign,
  FileText,
  Zap,
  Settings,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/ui/tabs";
import { lusitana } from "@/app/ui/utils/fonts";

interface Integration {
  id: string;
  name: string;
  category: "payment" | "sms" | "accounting";
  description: string;
  icon: any;
  enabled: boolean;
  config: Record<string, string>;
}

export default function ManageIntegrations() {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: "stripe",
      name: "Stripe",
      category: "payment",
      description: "Accept credit card and debit card payments",
      icon: CreditCard,
      enabled: true,
      config: {
        publishableKey: "pk_test_••••••••••••••••",
        secretKey: "sk_test_••••••••••••••••",
      },
    },
    {
      id: "paypal",
      name: "PayPal",
      category: "payment",
      description: "Accept PayPal payments worldwide",
      icon: DollarSign,
      enabled: false,
      config: {
        clientId: "",
        clientSecret: "",
      },
    },
    {
      id: "twilio",
      name: "Twilio",
      category: "sms",
      description: "Send SMS notifications to customers",
      icon: MessageSquare,
      enabled: true,
      config: {
        accountSid: "AC••••••••••••••••",
        authToken: "••••••••••••••••",
        phoneNumber: "+1234567890",
      },
    },
    {
      id: "africas_talking",
      name: "Africa's Talking",
      category: "sms",
      description: "SMS gateway for African markets",
      icon: MessageSquare,
      enabled: false,
      config: {
        apiKey: "",
        username: "",
      },
    },
    {
      id: "quickbooks",
      name: "QuickBooks",
      category: "accounting",
      description: "Sync transactions with QuickBooks",
      icon: FileText,
      enabled: false,
      config: {
        clientId: "",
        clientSecret: "",
      },
    },
    {
      id: "xero",
      name: "Xero",
      category: "accounting",
      description: "Integrate with Xero accounting software",
      icon: FileText,
      enabled: false,
      config: {
        clientId: "",
        clientSecret: "",
      },
    },
  ]);

  const [selectedIntegration, setSelectedIntegration] =
    useState<Integration | null>(null);
  const [webhookUrl, setWebhookUrl] = useState(
    "https://api.rentcars.com/webhooks",
  );
  const [webhookSecret, setWebhookSecret] = useState(
    "whsec_••••••••••••••••••••",
  );

  const toggleIntegration = (id: string) => {
    setIntegrations(
      integrations.map((i) =>
        i.id === id ? { ...i, enabled: !i.enabled } : i,
      ),
    );
  };

  const updateConfig = (id: string, key: string, value: string) => {
    setIntegrations(
      integrations.map((i) =>
        i.id === id ? { ...i, config: { ...i.config, [key]: value } } : i,
      ),
    );
  };

  const paymentGateways = integrations.filter((i) => i.category === "payment");
  const smsGateways = integrations.filter((i) => i.category === "sms");
  const accountingSystems = integrations.filter(
    (i) => i.category === "accounting",
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`${lusitana.className} text-2xl`}>Integrations</h1>
        <p className="text-muted-foreground">
          Connect third-party services and manage API integrations
        </p>
      </div>

      <Tabs defaultValue="payment">
        <TabsList className="bg-gray-200 rounded-full">
          <TabsTrigger
            className="data-[state=active]:bg-white data-[state=active]:text-black rounded-full"
            value="payment"
          >
            Payment Gateways
          </TabsTrigger>
          <TabsTrigger
            className="data-[state=active]:bg-white data-[state=active]:text-black rounded-full"
            value="sms"
          >
            SMS Gateways
          </TabsTrigger>
          <TabsTrigger
            className="data-[state=active]:bg-white data-[state=active]:text-black rounded-full"
            value="accounting"
          >
            Accounting Systems
          </TabsTrigger>
          <TabsTrigger
            className="data-[state=active]:bg-white data-[state=active]:text-black rounded-full"
            value="webhooks"
          >
            Webhooks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payment" className="space-y-4">
          <div className="grid gap-4">
            {paymentGateways.map((integration) => {
              const Icon = integration.icon;
              return (
                <Card key={integration.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-lg bg-blue-100">
                          <Icon className="size-6 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle
                            className={`${lusitana.className} text-lg`}
                          >
                            {integration.name}
                          </CardTitle>
                          <CardDescription className="text-sm text-gray-500">
                            {integration.description}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={
                            integration.enabled ? "default" : "secondary"
                          }
                          className={
                            integration.enabled
                              ? "bg-blue-600 text-white"
                              : "bg-gray-200 text-gray-800"
                          }
                        >
                          {integration.enabled ? "Enabled" : "Disabled"}
                        </Badge>
                        <Switch
                          checked={integration.enabled}
                          onCheckedChange={() =>
                            toggleIntegration(integration.id)
                          }
                          className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-400 [&_[data-slot=switch-thumb]]:bg-white"
                        />
                      </div>
                    </div>
                  </CardHeader>
                  {integration.enabled && (
                    <CardContent className="space-y-4">
                      {Object.entries(integration.config).map(
                        ([key, value]) => (
                          <div key={key} className="space-y-2">
                            <Label className="capitalize">
                              {key.replace(/([A-Z])/g, " $1").trim()}
                            </Label>
                            <Input
                              type={
                                key.toLowerCase().includes("secret") ||
                                key.toLowerCase().includes("key")
                                  ? "password"
                                  : "text"
                              }
                              value={value}
                              onChange={(e) =>
                                updateConfig(
                                  integration.id,
                                  key,
                                  e.target.value,
                                )
                              }
                              className="border-gray-100 bg-gray-100 focus:border-gray-500"
                            />
                          </div>
                        ),
                      )}
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        Save Configuration
                      </Button>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="sms" className="space-y-4">
          <div className="grid gap-4">
            {smsGateways.map((integration) => {
              const Icon = integration.icon;
              return (
                <Card key={integration.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-lg bg-green-100">
                          <Icon className="size-6 text-green-600" />
                        </div>
                        <div>
                          <CardTitle
                            className={`${lusitana.className} text-lg`}
                          >
                            {integration.name}
                          </CardTitle>
                          <CardDescription className="text-sm text-gray-500">
                            {integration.description}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={
                            integration.enabled ? "default" : "secondary"
                          }
                          className={
                            integration.enabled
                              ? "text-white bg-blue-600"
                              : "bg-gray-200 text-gray-800"
                          }
                        >
                          {integration.enabled ? "Enabled" : "Disabled"}
                        </Badge>
                        <Switch
                          checked={integration.enabled}
                          onCheckedChange={() =>
                            toggleIntegration(integration.id)
                          }
                          className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-400 [&_[data-slot=switch-thumb]]:bg-white"
                        />
                      </div>
                    </div>
                  </CardHeader>
                  {integration.enabled && (
                    <CardContent className="space-y-4">
                      {Object.entries(integration.config).map(
                        ([key, value]) => (
                          <div key={key} className="space-y-2">
                            <Label className="capitalize">
                              {key.replace(/([A-Z])/g, " $1").trim()}
                            </Label>
                            <Input
                              type={
                                key.toLowerCase().includes("token") ||
                                key.toLowerCase().includes("key")
                                  ? "password"
                                  : "text"
                              }
                              className="border-gray-100 bg-gray-100 focus:border-gray-400"
                              value={value}
                              onChange={(e) =>
                                updateConfig(
                                  integration.id,
                                  key,
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                        ),
                      )}
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        Save Configuration
                      </Button>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="accounting" className="space-y-4">
          <div className="grid gap-4">
            {accountingSystems.map((integration) => {
              const Icon = integration.icon;
              return (
                <Card key={integration.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-lg bg-purple-100">
                          <Icon className="size-6 text-purple-600" />
                        </div>
                        <div>
                          <CardTitle>{integration.name}</CardTitle>
                          <CardDescription>
                            {integration.description}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={
                            integration.enabled ? "default" : "secondary"
                          }
                          className={
                            integration.enabled
                              ? "bg-blue-600 text-white"
                              : "bg-gray-200 text-gray-800"
                          }
                        >
                          {integration.enabled ? "Enabled" : "Disabled"}
                        </Badge>
                        <Switch
                          checked={integration.enabled}
                          onCheckedChange={() =>
                            toggleIntegration(integration.id)
                          }
                          className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-400 [&_[data-slot=switch-thumb]]:bg-white"
                        />
                      </div>
                    </div>
                  </CardHeader>
                  {integration.enabled && (
                    <CardContent className="space-y-4">
                      {Object.entries(integration.config).map(
                        ([key, value]) => (
                          <div key={key} className="space-y-2">
                            <Label className="capitalize">
                              {key.replace(/([A-Z])/g, " $1").trim()}
                            </Label>
                            <Input
                              type={
                                key.toLowerCase().includes("secret")
                                  ? "password"
                                  : "text"
                              }
                              value={value}
                              onChange={(e) =>
                                updateConfig(
                                  integration.id,
                                  key,
                                  e.target.value,
                                )
                              }
                              className=" border-gray-100 bg-gray-100 focus:border-gray-400"
                            />
                          </div>
                        ),
                      )}
                      <div className="flex gap-2">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                          Save Configuration
                        </Button>
                        <Button
                          variant="outline"
                          className="border-gray-300  hover:bg-gray-200"
                        >
                          Test Connection
                        </Button>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="webhooks">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-orange-100">
                    <Zap className="size-6 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle className={`${lusitana.className} text-lg`}>
                      Webhook Configuration
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-500">
                      Receive real-time event notifications via webhooks
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Webhook URL</Label>
                  <Input
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://your-domain.com/webhooks"
                    className="border-gray-100 bg-gray-100 focus:border-gray-500"
                  />
                  <p className="text-xs text-muted-foreground">
                    This URL will receive POST requests for all webhook events
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Webhook Secret</Label>
                  <Input
                    type="password"
                    value={webhookSecret}
                    onChange={(e) => setWebhookSecret(e.target.value)}
                    placeholder="Enter a secret key"
                    className="border-gray-100 bg-gray-100 focus:border-gray-500"
                  />
                  <p className="text-xs text-muted-foreground">
                    Used to verify webhook authenticity
                  </p>
                </div>
                <div className="space-y-3 ">
                  <Label>Webhook Events</Label>
                  <div className="space-y-2 border border-gray-300 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">booking.created</p>
                        <p className="text-xs text-muted-foreground">
                          Triggered when a new booking is created
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">booking.updated</p>
                        <p className="text-xs text-muted-foreground">
                          Triggered when a booking is modified
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">booking.cancelled</p>
                        <p className="text-xs text-muted-foreground">
                          Triggered when a booking is cancelled
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">payment.received</p>
                        <p className="text-xs text-muted-foreground">
                          Triggered when payment is processed
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">payment.refunded</p>
                        <p className="text-xs text-muted-foreground">
                          Triggered when a refund is issued
                        </p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Save Webhook Settings
                  </Button>
                  <Button
                    variant="outline"
                    className="border-gray-300 hover:bg-gray-200"
                  >
                    Test Webhook
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className={`${lusitana.className} text-lg`}>
                  Recent Webhook Deliveries
                </CardTitle>
                <CardDescription className="text-sm text-gray-500">
                  Latest webhook events sent
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    {
                      event: "booking.created",
                      status: "success",
                      time: "2 minutes ago",
                    },
                    {
                      event: "payment.received",
                      status: "success",
                      time: "15 minutes ago",
                    },
                    {
                      event: "booking.updated",
                      status: "failed",
                      time: "1 hour ago",
                    },
                  ].map((delivery, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between border border-gray-300 rounded-lg p-3"
                    >
                      <div className="flex items-center gap-3">
                        <Badge
                          className="border-gray-300 bg-gray-100"
                          variant="outline"
                        >
                          {delivery.event}
                        </Badge>
                        <span className="text-sm text-muted-foreground ">
                          {delivery.time}
                        </span>
                      </div>
                      <Badge
                        variant={
                          delivery.status === "success"
                            ? "default"
                            : delivery.status === "failed"
                              ? "destructive"
                              : "secondary"
                        }
                        className={
                          delivery.status === "success"
                            ? "bg-green-600 text-white"
                            : delivery.status === "failed"
                              ? "bg-red-600 text-white"
                              : "bg-gray-200 text-gray-800"
                        }
                      >
                        {delivery.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
