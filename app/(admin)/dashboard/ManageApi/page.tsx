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
import { Textarea } from "@/app/ui/textarea";
import {
  Code,
  Key,
  Copy,
  RefreshCw,
  Trash2,
  Plus,
  Eye,
  EyeOff,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/ui/dialog";
import { toast } from "sonner";
import { lusitana } from "@/app/ui/utils/fonts";

interface APIKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  createdAt: string;
  lastUsed: string;
  status: "active" | "inactive";
}

interface APILog {
  id: string;
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  statusCode: number;
  responseTime: number;
  timestamp: string;
  apiKeyName: string;
}

const mockAPIKeys: APIKey[] = [
  {
    id: "1",
    name: "Production API Key",
    key: "sk_live_••••••••••••••••••••••••••••",
    permissions: ["read:cars", "write:bookings", "read:users"],
    createdAt: "2024-01-15",
    lastUsed: "2024-02-25 10:30 AM",
    status: "active",
  },
  {
    id: "2",
    name: "Mobile App API Key",
    key: "sk_live_••••••••••••••••••••••••••••",
    permissions: ["read:cars", "write:bookings"],
    createdAt: "2024-02-01",
    lastUsed: "2024-02-25 11:45 AM",
    status: "active",
  },
];

const mockAPILogs: APILog[] = [
  {
    id: "1",
    endpoint: "/api/v1/cars",
    method: "GET",
    statusCode: 200,
    responseTime: 45,
    timestamp: "2024-02-25 11:45:30",
    apiKeyName: "Mobile App API Key",
  },
  {
    id: "2",
    endpoint: "/api/v1/bookings",
    method: "POST",
    statusCode: 201,
    responseTime: 120,
    timestamp: "2024-02-25 11:40:15",
    apiKeyName: "Production API Key",
  },
  {
    id: "3",
    endpoint: "/api/v1/users/123",
    method: "GET",
    statusCode: 200,
    responseTime: 32,
    timestamp: "2024-02-25 11:35:20",
    apiKeyName: "Production API Key",
  },
];

const API_DOCUMENTATION = {
  endpoints: [
    {
      method: "GET",
      path: "/api/v1/cars",
      description: "Retrieve all available cars",
      parameters: "?page=1&limit=10&status=available",
    },
    {
      method: "GET",
      path: "/api/v1/cars/:id",
      description: "Retrieve a specific car by ID",
      parameters: "",
    },
    {
      method: "POST",
      path: "/api/v1/bookings",
      description: "Create a new booking",
      parameters: "",
    },
    {
      method: "PUT",
      path: "/api/v1/bookings/:id",
      description: "Update an existing booking",
      parameters: "",
    },
    {
      method: "GET",
      path: "/api/v1/users",
      description: "Retrieve all users",
      parameters: "?page=1&limit=10",
    },
  ],
};

export default function ManageAPI() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>(mockAPIKeys);
  const [apiLogs] = useState<APILog[]>(mockAPILogs);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [showKey, setShowKey] = useState<{ [key: string]: boolean }>({});
  const [newKeyName, setNewKeyName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const availablePermissions = [
    "read:cars",
    "write:cars",
    "read:bookings",
    "write:bookings",
    "read:users",
    "write:users",
    "read:payments",
    "write:payments",
  ];

  const generateAPIKey = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let key = "sk_live_";
    for (let i = 0; i < 32; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
  };

  const handleCreateKey = () => {
    const newKey: APIKey = {
      id: Date.now().toString(),
      name: newKeyName,
      key: generateAPIKey(),
      permissions: selectedPermissions,
      createdAt: new Date().toISOString().split("T")[0],
      lastUsed: "Never",
      status: "active",
    };
    setApiKeys([...apiKeys, newKey]);
    setIsCreateDialogOpen(false);
    setNewKeyName("");
    setSelectedPermissions([]);
    toast.success("API key created successfully");
  };

  const handleRevokeKey = (id: string) => {
    if (
      confirm(
        "Are you sure you want to revoke this API key? This action cannot be undone.",
      )
    ) {
      setApiKeys(
        apiKeys.map((key) =>
          key.id === id ? { ...key, status: "inactive" as const } : key,
        ),
      );
      toast.success("API key revoked");
    }
  };

  const handleDeleteKey = (id: string) => {
    if (confirm("Are you sure you want to delete this API key?")) {
      setApiKeys(apiKeys.filter((key) => key.id !== id));
      toast.success("API key deleted");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const toggleShowKey = (id: string) => {
    setShowKey({ ...showKey, [id]: !showKey[id] });
  };

  const getStatusBadgeColor = (code: number) => {
    if (code >= 200 && code < 300) return "bg-green-100 text-green-800";
    if (code >= 400 && code < 500) return "bg-yellow-100 text-yellow-800";
    if (code >= 500) return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`${lusitana.className} text-2xl`}>
          API & Technical Tools
        </h1>
        <p className="text-muted-foreground text-gray-500">
          Manage REST API access, webhooks, and monitor API usage
        </p>
      </div>

      <Tabs defaultValue="keys">
        <TabsList className="bg-gray-200 rounded-full">
          <TabsTrigger
            className="data-[state=active]:bg-white data-[state=active]:text-black rounded-full"
            value="keys"
          >
            API Keys
          </TabsTrigger>
          <TabsTrigger
            className="data-[state=active]:bg-white data-[state=active]:text-black rounded-full"
            value="docs"
          >
            Documentation
          </TabsTrigger>
          <TabsTrigger
            className="data-[state=active]:bg-white data-[state=active]:text-black rounded-full"
            value="logs"
          >
            API Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="keys" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className={`${lusitana.className} text-lg`}>
                    API Keys
                  </CardTitle>
                  <CardDescription className="text-gray-500">
                    Manage API keys for external integrations
                  </CardDescription>
                </div>
                <Dialog
                  open={isCreateDialogOpen}
                  onOpenChange={setIsCreateDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Plus className="size-4 mr-2" />
                      Create API Key
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white border-none">
                    <DialogHeader>
                      <DialogTitle>Create New API Key</DialogTitle>
                      <DialogDescription>
                        Generate a new API key for external applications
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Key Name</Label>
                        <Input
                          value={newKeyName}
                          onChange={(e) => setNewKeyName(e.target.value)}
                          placeholder="e.g., Production API, Mobile App"
                          className="border-gray-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Permissions</Label>
                        <div className="border  border-gray-400 rounded-lg p-3 space-y-2">
                          {availablePermissions.map((permission) => (
                            <label
                              key={permission}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={selectedPermissions.includes(
                                  permission,
                                )}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedPermissions([
                                      ...selectedPermissions,
                                      permission,
                                    ]);
                                  } else {
                                    setSelectedPermissions(
                                      selectedPermissions.filter(
                                        (p) => p !== permission,
                                      ),
                                    );
                                  }
                                }}
                                className="rounded"
                              />
                              <span className="text-sm">{permission}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsCreateDialogOpen(false)}
                        className="hover:bg-gray-200 border-gray-300"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCreateKey}
                        disabled={
                          !newKeyName || selectedPermissions.length === 0
                        }
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Create Key
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apiKeys.map((apiKey) => (
                  <div
                    key={apiKey.id}
                    className="border border-gray-300 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{apiKey.name}</h4>
                          <Badge
                            variant={
                              apiKey.status === "active"
                                ? "default"
                                : "secondary"
                            }
                            className={
                              apiKey.status === "active"
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 text-gray-800"
                            }
                          >
                            {apiKey.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground text-gray-500">
                          Created {apiKey.createdAt} • Last used{" "}
                          {apiKey.lastUsed}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-50 rounded px-3 py-2 font-mono text-sm">
                          {showKey[apiKey.id] ? apiKey.key : apiKey.key}
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => toggleShowKey(apiKey.id)}
                          className="border-gray-300 hover:bg-gray-200"
                        >
                          {showKey[apiKey.id] ? (
                            <EyeOff className="size-4" />
                          ) : (
                            <Eye className="size-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => copyToClipboard(apiKey.key)}
                          className="border-gray-300 hover:bg-gray-200"
                        >
                          <Copy className="size-4" />
                        </Button>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1 text-gray-500">
                          Permissions:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {apiKey.permissions.map((permission) => (
                            <Badge
                              key={permission}
                              variant="outline"
                              className="text-xs border-gray-300"
                            >
                              {permission}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {apiKey.status === "active" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRevokeKey(apiKey.id)}
                            className="border-gray-400 hover:bg-gray-200"
                          >
                            <RefreshCw className="size-3 mr-1" />
                            Revoke
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteKey(apiKey.id)}
                          className="border-gray-400 hover:bg-gray-200"
                        >
                          <Trash2 className="size-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="docs">
          <Card>
            <CardHeader>
              <CardTitle className={`${lusitana.className} text-lg`}>REST API Documentation</CardTitle>
              <CardDescription className="text-gray-500">
                Available API endpoints and their usage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Base URL</h4>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-white px-3 py-2 rounded text-sm">
                      https://api.rentcars.com/v1
                    </code>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        copyToClipboard("https://api.rentcars.com/v1")
                      }
                      className="border-gray-300 hover:bg-gray-200"
                    >
                      <Copy className="size-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className={`${lusitana.className} text-lg`}>Available Endpoints</h4>
                  {API_DOCUMENTATION.endpoints.map((endpoint, i) => (
                    <div key={i} className="border border-gray-300 rounded-lg p-4">
                      <div className="flex items-start gap-3 mb-2">
                        <Badge
                          variant={
                            endpoint.method === "GET" ? "default" : "secondary"
                          }
                          className={endpoint.method === "GET" ? "bg-blue-600 text-white" : "bg-gray-500 text-white"}
                        >
                          {endpoint.method}
                        </Badge>
                        <div className="flex-1">
                          <code className="text-sm font-semibold">
                            {endpoint.path}
                          </code>
                          <p className="text-sm text-muted-foreground mt-1 text-gray-500">
                            {endpoint.description}
                          </p>
                          {endpoint.parameters && (
                            <p className="text-xs text-muted-foreground mt-1 text-gray-500">
                              Params:{" "}
                              <code className="bg-gray-100 px-1 rounded">
                                {endpoint.parameters}
                              </code>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                  <h4 className={`${lusitana.className} text-lg mb-2`}>Authentication</h4>
                  <p className="text-sm text-muted-foreground mb-3 text-gray-500">
                    Include your API key in the request header:
                  </p>
                  <code className="block bg-white px-3 py-2 rounded text-sm">
                    Authorization: Bearer YOUR_API_KEY
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>API Request Logs</CardTitle>
              <CardDescription>Monitor recent API activity</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className=" border-gray-300">
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Endpoint</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Response Time</TableHead>
                    <TableHead>API Key</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiLogs.map((log) => (
                    <TableRow key={log.id} className="border-gray-300 hover:bg-gray-100">
                      <TableCell className="text-sm">{log.timestamp}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.method}</Badge>
                      </TableCell>
                      <TableCell>
                        <code className="text-sm">{log.endpoint}</code>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={getStatusBadgeColor(log.statusCode)}
                          variant="secondary"
                        >
                          {log.statusCode}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {log.responseTime}ms
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {log.apiKeyName}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
