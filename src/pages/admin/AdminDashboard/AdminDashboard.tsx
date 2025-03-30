import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Users, BookOpen, DollarSign, TrendingUp } from "lucide-react";
import "./AdminDashboard.scss";
import { useAppSelector } from "../../../hooks/reduxHooks";
import axiosInstance from "../../../shared/config/axiosConfig";
import API from "../../../shared/constants/API";
import ISubscription from "../../../entities/ISubscription";

type TimeFilter = "daily" | "monthly" | "yearly";
type DataPoint = { date: string; amount: number };
const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

interface IOrder {
  userEmail: string;
  plan: string;
  startDate: Date;
  endDate: Date;
  amount: number;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  status?: "pending" | "completed" | "failed";
}

const AdminDashboard = () => {
  const { userInfo } = useAppSelector((state) => state.user);
  const [tutorCount, setTutorCount] = useState(0);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [orderData, setOrderData] = useState<IOrder[]>([]);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("daily");
  const [chartData, setChartData] = useState<DataPoint[]>([]);

  const getTutorsCount = async () => {
    try {
      const tutors = await axiosInstance.get(API.TUTORS_GET);
      setTutorCount(tutors.data.length);
    } catch (error) {
      console.log("error getting tutors count", error);
      setTutorCount(0);
    }
  };

  const getSubscribersCount = async () => {
    try {
      const subscribers = await axiosInstance.get("/subsciption");
      const count = subscribers.data.data.data.reduce(
        (acc: number, curr: ISubscription) => {
          acc += curr.users.length;
          return acc;
        },
        0
      );
      setSubscriberCount(count);
    } catch (error) {
      console.log("error getting subscriber count", error);
      setSubscriberCount(0);
    }
  };

  const getOrdersData = async () => {
    try {
      const orders = await axiosInstance.get("/order");

      const formattedOrders = orders.data.data.map((order: any) => ({
        ...order,
        startDate: new Date(order.startDate),
        endDate: new Date(order.endDate),
      }));

      setOrderData(formattedOrders);
    } catch (error) {
      console.error("Error fetching order data:", error);
      setOrderData([]);
    }
  };

  const processOrderData = () => {
    if (!orderData.length) return;

    const dataMap = new Map<string, number>();

    const completedOrders = orderData.filter(
      (order) => order.status === "completed"
    );

    switch (timeFilter) {
      case "daily": {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        for (let i = 0; i < 7; i++) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = `${String(date.getDate()).padStart(2, "0")}/${String(
            date.getMonth() + 1
          ).padStart(2, "0")}`;
          dataMap.set(dateStr, 0);
        }

        completedOrders.forEach((order) => {
          const orderDate = new Date(order.startDate);
          if (orderDate >= sevenDaysAgo) {
            const dateStr = `${String(orderDate.getDate()).padStart(
              2,
              "0"
            )}/${String(orderDate.getMonth() + 1).padStart(2, "0")}`;

            if (dataMap.has(dateStr)) {
              dataMap.set(dateStr, (dataMap.get(dateStr) || 0) + order.amount);
            }
          }
        });
        break;
      }

      case "monthly": {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        for (let i = 0; i < 6; i++) {
          const month = new Date();
          month.setMonth(month.getMonth() - i);
          const monthStr = months[month.getMonth()];
          dataMap.set(monthStr, 0);
        }

        completedOrders.forEach((order) => {
          const orderDate = new Date(order.startDate);
          if (orderDate >= sixMonthsAgo) {
            const monthStr = months[orderDate.getMonth()];
            if (dataMap.has(monthStr)) {
              dataMap.set(
                monthStr,
                (dataMap.get(monthStr) || 0) + order.amount
              );
            }
          }
        });
        break;
      }

      case "yearly": {
        const fiveYearsAgo = new Date();
        fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);

        for (let i = 0; i < 5; i++) {
          const year = new Date();
          year.setFullYear(year.getFullYear() - i);
          const yearStr = String(year.getFullYear());
          dataMap.set(yearStr, 0);
        }

        completedOrders.forEach((order) => {
          const orderDate = new Date(order.startDate);
          if (orderDate >= fiveYearsAgo) {
            const yearStr = String(orderDate.getFullYear());
            if (dataMap.has(yearStr)) {
              dataMap.set(yearStr, (dataMap.get(yearStr) || 0) + order.amount);
            }
          }
        });
        break;
      }
    }

    let dataPointsArray: DataPoint[] = Array.from(dataMap.entries()).map(
      ([date, amount]) => ({ date, amount })
    );

    if (timeFilter === "daily") {
      dataPointsArray = dataPointsArray.sort((a, b) => {
        const [dayA, monthA] = a.date.split("/").map(Number);
        const [dayB, monthB] = b.date.split("/").map(Number);
        if (monthA !== monthB) return monthA - monthB;
        return dayA - dayB;
      });
    } else if (timeFilter === "monthly") {
      dataPointsArray = dataPointsArray.sort(
        (a, b) => months.indexOf(a.date) - months.indexOf(b.date)
      );
    } else {
      dataPointsArray = dataPointsArray.sort(
        (a, b) => parseInt(a.date) - parseInt(b.date)
      );
    }

    setChartData(dataPointsArray);
  };

  useEffect(() => {
    getTutorsCount();
    getSubscribersCount();
    getOrdersData();
  }, []);

  useEffect(() => {
    processOrderData();
  }, [orderData, timeFilter]);

  const renderLineChart = () => (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart width={600} height={300} data={chartData}>
        <Line type="monotone" dataKey="amount" stroke="#8884d8" />
        <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
      </LineChart>
    </ResponsiveContainer>
  );

  return (
    <div className="dashboard">
      <h1 className="dashboard__heading">Dashboard</h1>
      <div className="dashboard__stats">
        <div className="stat-box">
          <div className="stat-box__icon-container">
            <Users className="stat-box__icon" />
          </div>
          <div className="stat-box__content">
            <h3 className="stat-box__title">Subscribers</h3>
            <p className="stat-box__value">{subscriberCount}</p>
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-box__icon-container">
            <BookOpen className="stat-box__icon" />
          </div>
          <div className="stat-box__content">
            <h3 className="stat-box__title">Tutors</h3>
            <p className="stat-box__value">{tutorCount}</p>
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-box__icon-container">
            <DollarSign className="stat-box__icon" />
          </div>
          <div className="stat-box__content">
            <h3 className="stat-box__title">Current Balance</h3>
            <p className="stat-box__value">₹{userInfo?.wallet}</p>
          </div>
        </div>
      </div>

      <div className="dashboard__chart-container">
        <div className="dashboard__chart-header">
          <h2 className="dashboard__chart-title">
            <TrendingUp className="dashboard__chart-icon" />
            Earnings Overview
          </h2>

          <div className="dashboard__chart-filters">
            {["daily", "monthly", "yearly"].map((filter) => (
              <button
                key={filter}
                className={`filter-btn ${
                  timeFilter === filter ? "active" : ""
                }`}
                onClick={() => setTimeFilter(filter as TimeFilter)}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="dashboard__chart">
          {chartData.length > 0 ? (
            renderLineChart()
          ) : (
            <div className="no-data-message">No order data available</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
