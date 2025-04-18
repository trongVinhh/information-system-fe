import React, { useState, useEffect } from "react";
import { Table, Tag, Select, DatePicker } from "antd";
import {
  PieChart,
  Pie,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  XAxis,
  BarChart,
  CartesianGrid,
  Bar,
  YAxis,
} from "recharts";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

const { Option } = Select;
const { MonthPicker } = DatePicker;

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#A28CF1",
  "#F16A77",
];

const FinanceTable = ({ onDataLoad }) => {
  const storedToken = localStorage.getItem("idToken");
  const [data, setData] = useState([]);
  const [types, setTypes] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [balance, setBalance] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    fetchData();
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const formatCurrencyToNumber = (value) => {
    if (!value) return 0;
    return parseFloat(value.replace(/\./g, "").replace(",", "."));
  };

  const fetchData = async () => {
    const response = await fetch("https://backend.genbook.site/user/my-sheet", {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${storedToken}`,
      },
    });

    if (!response.ok) throw new Error("Failed to fetch data");

    const responseData = await response.json();

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${responseData.sheetId}/values/${responseData.range}?key=${responseData.apiKey}`;

    try {
      const response = await fetch(url);
      const result = await response.json();
      if (result.values) {
        const rows = result.values.slice(1);
        const formattedData = rows.map((row, index) => ({
          key: row[0] || index + 1,
          amount: formatCurrencyToNumber(row[1]),
          type: row[2] || "EXPENSE",
          note: row[3] || "",
          category: row[4] || "OTHER",
          date: row[5]
            ? dayjs(row[5], ["DD/MM/YYYY HH:mm:ss", "YYYY-MM-DD"]).format(
                "YYYY-MM-DD"
              )
            : "",
        }));
        setData(formattedData);
        setFilteredData(formattedData);
        setCategories([...new Set(formattedData.map((item) => item.category))]);
        setTypes([...new Set(formattedData.map((item) => item.type))]);
        if (onDataLoad) onDataLoad(formattedData);
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu từ Google Sheets:", error);
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    filterData(date, selectedCategory, selectedType);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    filterData(selectedDate, category, selectedType);
  };

  const handleTypeChange = (type) => {
    console.log("Selected type:", type);
    setSelectedType(type);
    filterData(selectedDate, selectedCategory, type);
  };

  const filterData = (date, category, type) => {
    let filtered = data;
    if (date) {
      const selectedMonthStr = dayjs(date).format("YYYY-MM");
      filtered = filtered.filter((item) =>
        item.date.startsWith(selectedMonthStr)
      );
    }
    if (category) {
      filtered = filtered.filter((item) => item.category === category);
    }
    if (type) {
      filtered = filtered.filter((item) => item.type === type);
    }
    setFilteredData(filtered);

    const totalIncome = filtered
      .filter((item) => item.type === "INCOME")
      .reduce((sum, item) => sum + item.amount, 0);
    const totalExpense = filtered
      .filter((item) => item.type === "EXPENSE")
      .reduce((sum, item) => sum + item.amount, 0);
    setTotalIncome(totalIncome);
    setTotalExpense(totalExpense);
    setBalance(totalIncome - totalExpense);
  };

  useEffect(() => {
    filterData(selectedDate, selectedCategory, selectedType);
  }, [data]);

  const expenseChartData = categories
    .map((category) => ({
      name: category,
      value: filteredData
        .filter((item) => item.type === "EXPENSE" && item.category === category)
        .reduce((sum, item) => sum + item.amount, 0),
    }))
    .filter((item) => item.value > 0);

  const incomeChartData = categories
    .map((category) => ({
      name: category,
      value: filteredData
        .filter((item) => item.type === "INCOME" && item.category === category)
        .reduce((sum, item) => sum + item.amount, 0),
    }))
    .filter((item) => item.value > 0);

  const currentYear = selectedDate
    ? dayjs(selectedDate).year()
    : dayjs().year();
  const yearlyData = Array.from({ length: 12 }, (_, i) => {
    const month = (i + 1).toString().padStart(2, "0");
    return {
      month: `${month}`,
      income: data
        .filter(
          (item) =>
            item.date.startsWith(`${currentYear}-${month}`) &&
            item.type === "INCOME"
        )
        .reduce((sum, item) => sum + item.amount, 0),
      expense: data
        .filter(
          (item) =>
            item.date.startsWith(`${currentYear}-${month}`) &&
            item.type === "EXPENSE"
        )
        .reduce((sum, item) => sum + item.amount, 0),
    };
  });

  const columns = isMobile
    ? [
        { title: "Ngày", dataIndex: "date", key: "date" },
        {
          title: "Số tiền",
          dataIndex: "amount",
          key: "amount",
          render: (text) => text.toLocaleString() + " VND",
        },
        { title: "Ghi chú", dataIndex: "note", key: "note" },
      ]
    : [
        { title: "STT", dataIndex: "key", key: "key" },
        { title: "Ngày", dataIndex: "date", key: "date" },
        {
          title: "Loại",
          dataIndex: "type",
          key: "type",
          render: (type) => (
            <Tag color={type === "EXPENSE" ? "red" : "green"}>{type}</Tag>
          ),
        },
        { title: "Danh mục", dataIndex: "category", key: "category" },
        {
          title: "Số tiền",
          dataIndex: "amount",
          key: "amount",
          render: (text) => text.toLocaleString() + " VND",
        },
        { title: "Ghi chú", dataIndex: "note", key: "note" },
      ];

  return (
    <div style={{ padding: isMobile ? 0 : 20 }}>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <MonthPicker
          onChange={handleDateChange}
          placeholder="Chọn tháng"
          allowClear
          defaultValue={selectedDate}
          format="MM/YYYY"
        />
        <Select
          placeholder="Chọn loại"
          style={{ width: 200 }}
          onChange={handleTypeChange}
          allowClear
        >
          {types.map((cat) => (
            <Option key={cat} value={cat}>
              {cat}
            </Option>
          ))}
        </Select>
        <Select
          placeholder="Chọn danh mục"
          style={{ width: 200 }}
          onChange={handleCategoryChange}
          allowClear
        >
          {categories.map((cat) => (
            <Option key={cat} value={cat}>
              {cat}
            </Option>
          ))}
        </Select>
      </div>

      <div style={{ marginBottom: 16, fontSize: "18px" }}>
        <p>
          <b>Tổng thu nhập:</b>{" "}
          <span style={{ color: "green" }}>
            {totalIncome.toLocaleString()} VND
          </span>
        </p>
        <p>
          <b>Tổng chi tiêu:</b>{" "}
          <span style={{ color: "red" }}>
            {totalExpense.toLocaleString()} VND
          </span>
        </p>
        <p>
          <b>Số dư:</b>{" "}
          <span style={{ color: balance >= 0 ? "blue" : "red" }}>
            {balance.toLocaleString()} VND
          </span>
        </p>
      </div>

      <div style={{ overflowX: "auto" }}>
        <Table
          columns={columns}
          dataSource={filteredData}
          bordered
          pagination={{ pageSize: 5 }}
        />
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: isMobile ? "center" : "space-between",
          alignItems: isMobile ? "center" : "",
          gap: 20,
          marginTop: 30,
        }}
      >
        <div
          style={{ flex: 1, width: isMobile ? "100%" : "50%"}}
        >
          <h3>Biểu đồ thu nhập</h3>
          <ResponsiveContainer width="100%" height={380}>
            <PieChart>
              <Pie
                data={incomeChartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#82ca9d"
                label
              >
                {incomeChartData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div
          style={{ flex: 1, width: isMobile ? "100%" : "50%"}}
        >
          <h3>Biểu đồ chi tiêu</h3>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={expenseChartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label
              >
                {expenseChartData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ marginTop: 30 }}>
        <h3>Biểu đồ thu chi các tháng trong năm</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={yearlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="income" fill="#00C49F" name="Thu nhập" />
            <Bar dataKey="expense" fill="#FF8042" name="Chi tiêu" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FinanceTable;
