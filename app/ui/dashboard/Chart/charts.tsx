"use client"
import { Card, CardContent, CardHeader, CardTitle } from "../../card";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { revenueData, bookingData, carTypeData } from "@/app/lib/data";
import { Calendar, Car, Users, DollarSign } from "lucide-react";


const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"]
export const RevenueChart = () => {
  return  <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

};


export const BookingChart = () => {
    return <Card>
          <CardHeader>
            <CardTitle>Weekly Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={bookingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip  />
                <Bar dataKey="bookings" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
};

export const CarTypeDistribution = () => {
    return <Card>
          <CardHeader>
            <CardTitle>Fleet Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={carTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {carTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
};

export const RecentActivity = () => {
    return <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <Calendar className="size-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm">New booking for Tesla Model 3</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Car className="size-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm">New car added to fleet</p>
                  <p className="text-xs text-muted-foreground">5 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-purple-100 p-2 rounded-full">
                  <Users className="size-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm">3 new users registered</p>
                  <p className="text-xs text-muted-foreground">1 day ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-orange-100 p-2 rounded-full">
                  <DollarSign className="size-4 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm">Payment of $245 received</p>
                  <p className="text-xs text-muted-foreground">1 day ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
};
