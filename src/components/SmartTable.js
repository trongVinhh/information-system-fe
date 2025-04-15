import React, { useEffect, useState } from "react";
import {
  Table,
  Input,
  Space,
  Button,
  message,
  Modal,
  Descriptions,
} from "antd";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  FileExcelOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import * as XLSX from "xlsx";
import { Link } from "react-router-dom";

export const SmartTableColumnNamesExample = () => {
  const storedToken = localStorage.getItem("idToken");
  const [items, setItems] = useState([]);
  const [displayedData, setDisplayedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [unlockKey, setUnlockKey] = useState("");
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [updatePassword, setUpdatePassword] = useState(""); // Xác nhận mật khẩu
  const [updateUnlockKey, setUpdateUnlockKey] = useState(""); // Key mở khóa password
  const [updatePasswordVisible, setUpdatePasswordVisible] = useState(false);

  useEffect(() => {
    if (!storedToken) {
      console.error("No token found in localStorage");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // const response = await fetch("https://backend.genbook.site/account", {
          const response = await fetch("https://backend.genbook.site/account/my-account", {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${storedToken}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch data");

        const responseData = await response.json();
        if (!responseData.data || !Array.isArray(responseData.data)) {
          throw new Error("Invalid data format");
        }

        const formattedData = responseData.data.map((item) => ({
          key: item._id,
          id: item._id,
          type: item.type,
          name: item.name,
          username: item.username,
          password: item.password,
          email: item.email,
          phone: item.phone,
          note: item.note,
        }));

        setItems(formattedData);
        setDisplayedData(formattedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [storedToken]);

  const handleSearch = (value) => {
    setSearchText(value);
    if (!value) {
      setDisplayedData(items);
      return;
    }
    const filtered = items.filter((item) =>
      Object.values(item).some(
        (val) =>
          val && val.toString().toLowerCase().includes(value.toLowerCase())
      )
    );
    setDisplayedData(filtered);
  };

  const handleViewDetails = (account) => {
    setSelectedAccount(account);
    setPasswordVisible(false); // Reset trạng thái password ẩn khi mở modal
    setUnlockKey(""); // Reset ô nhập key
    setIsModalOpen(true);
  };

  const handleUnlockPassword = () => {
    if (unlockKey === "123456") {
      setPasswordVisible(true);
      message.success("Password unlocked!");
    } else {
      message.error("Incorrect key! Please try again.");
    }
  };

  const handleUpdate = (account) => {
    console.log("Updating account:", account);
    setEditingAccount({ ...account, password: "" }); // Xóa password cũ khỏi input
    setUpdateUnlockKey(""); // Reset key mở khóa
    setUpdatePassword(""); // Reset ô nhập mật khẩu
    setUpdatePasswordVisible(false); // Ẩn password khi mở modal
    setIsUpdateModalOpen(true);
  };

  const handleUnlockUpdatePassword = () => {
    if (updateUnlockKey === "123456") {
      setUpdatePasswordVisible(true);
      message.success("Password unlocked!");
    } else {
      message.error("Incorrect key! Please try again.");
    }
  };

  const handleSaveUpdate = async () => {
    if (!editingAccount) return;

    if (editingAccount.password && !updatePassword) {
      message.error("Please enter your current password to update!");
      return;
    }

    try {
      const updatedData = {
        type: editingAccount.type,
        name: editingAccount.name,
        username: editingAccount.username,
        email: editingAccount.email,
        phone: editingAccount.phone,
        note: editingAccount.note,
      };

      if (editingAccount.password) {
        updatedData.password = editingAccount.password;
        updatedData.confirmPassword = updatePassword;
      }

      console.log("Eding account data:", editingAccount);

      const response = await fetch(
        `https://backend.genbook.site/account/${editingAccount.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${storedToken}`,
          },
          body: JSON.stringify(updatedData),
        }
      );

      if (!response.ok) throw new Error("Update failed");

      message.success("Account updated successfully!");
      setItems((prev) =>
        prev.map((item) =>
          item.id === editingAccount.id ? editingAccount : item
        )
      );
      setDisplayedData((prev) =>
        prev.map((item) =>
          item.id === editingAccount.id ? editingAccount : item
        )
      );
      setIsUpdateModalOpen(false);
    } catch (error) {
      console.error("Update failed:", error);
      message.error("Update failed!");
    }
  };

  const showDeleteConfirm = (id) => {
    Modal.confirm({
      title: "Confirm Delete",
      content: "Are you sure you want to delete this account?",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          const response = await fetch(
            `https://backend.genbook.site/account/${id}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${storedToken}`,
              },
            }
          );

          if (!response.ok) throw new Error("Failed to delete");

          message.success("Account deleted successfully!");
          setItems((prev) => prev.filter((item) => item.id !== id));
          setDisplayedData((prev) => prev.filter((item) => item.id !== id));
        } catch (error) {
          console.error("Delete failed:", error);
          message.error("Delete failed!");
        }
      },
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this account?"))
      return;

    try {
      const response = await fetch(
        `https://backend.genbook.site/account/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to delete");

      message.success("Account deleted successfully!");
      setItems((prev) => prev.filter((item) => item.id !== id));
      setDisplayedData((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Delete failed:", error);
      message.error("Delete failed!");
    }
  };

  const exportToExcel = () => {
    if (displayedData.length === 0) {
      message.error("Không có dữ liệu để xuất!");
      return;
    }

    // Chuẩn bị dữ liệu: AOA format (Array of Arrays)
    const aoaData = [
      ["ID", "Type", "Name", "Username", "Password", "Email", "Phone", "Note"], // Header
      ...displayedData.map((item) => [
        item.id,
        item.type,
        item.name,
        item.username,
        item.password,
        item.email,
        item.phone,
        item.note,
      ]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(aoaData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Accounts");

    // Tạo filter cho tất cả các cột
    ws["!autofilter"] = {
      ref: XLSX.utils.encode_range({
        s: { r: 0, c: 0 },
        e: { r: aoaData.length - 1, c: aoaData[0].length - 1 },
      }),
    };

    // Định dạng header (tô màu, in đậm, căn giữa)
    const headerRange = XLSX.utils.decode_range(ws["!ref"]);
    for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
      const cell_address = XLSX.utils.encode_cell({ r: 0, c: C });
      if (ws[cell_address]) {
        ws[cell_address].s = {
          fill: { fgColor: { rgb: "D3D3D3" } }, // Màu xám
          font: { bold: true },
          alignment: { horizontal: "center", vertical: "center" },
        };
      }
    }

    // Auto-fit cột theo nội dung thực tế
    const colWidths = aoaData[0].map((_, colIndex) =>
      Math.max(
        ...aoaData.map((row) =>
          row[colIndex] ? row[colIndex].toString().length + 5 : 10
        )
      )
    );

    ws["!cols"] = colWidths.map((wch) => ({ wch: wch + 2 })); // Thêm 2 đơn vị tránh bị sát mép

    // Tăng chiều cao cho header row
    ws["!rows"] = aoaData.map(() => ({ hpx: 20 }));

    XLSX.writeFile(wb, "accounts.xlsx");
    message.success("Xuất file Excel thành công!");
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      ellipsis: true,
      responsive: ["xs", "sm", "md", "lg"],
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      ellipsis: true,
      responsive: ["sm", "md", "lg"],
    },
    // {
    //   title: "Phone",
    //   dataIndex: "phone",
    //   key: "phone",
    //   ellipsis: true,
    //   responsive: ["lg"],
    // },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <EyeOutlined
            style={{ fontSize: "18px", color: "#1890ff", cursor: "pointer" }}
            onClick={() => handleViewDetails(record)}
          />
          <EditOutlined
            style={{ fontSize: "18px", color: "#faad14", cursor: "pointer" }}
            onClick={() => handleUpdate(record)}
          />
          <DeleteOutlined
            style={{ fontSize: "18px", color: "#ff4d4f", cursor: "pointer" }}
            onClick={() => showDeleteConfirm(record.id)}
          />
        </Space>
      ),
      responsive: ["xs", "sm", "md", "lg"],
    },
  ];

  return (
    <div className="table-responsive">
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <Space style={{ marginBottom: 16 }}>
            <Input.Search
              placeholder="Search"
              allowClear
              onSearch={handleSearch}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ width: "100%" }}
            />
            <Button
              type="primary"
              icon={<FileExcelOutlined />}
              onClick={exportToExcel}
            >
              Export Excel
            </Button>
            <Link
              className="btn btn-primary d-flex align-items-center justify-content-center"
              style={{ width: "32px", height: "32px"}}
              to="/create-account"
            >
              <PlusOutlined style={{ fontSize: "16px" }} />
            </Link>
          </Space>
          <Table
            columns={columns}
            dataSource={displayedData}
            scroll={{ x: "max-content" }}
          />
        </div>
      )}

      {/* 📝 Modal xem chi tiết account */}
      <Modal
        title="Account Details"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        {selectedAccount && (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Type">
              {selectedAccount.type}
            </Descriptions.Item>
            <Descriptions.Item label="Name">
              {selectedAccount.name}
            </Descriptions.Item>
            <Descriptions.Item label="Username">
              {selectedAccount.username}
            </Descriptions.Item>
            <Descriptions.Item label="Password">
              {passwordVisible ? (
                selectedAccount.password
              ) : (
                <span>• • • • • •</span>
              )}
              {!passwordVisible && (
                <div style={{ marginTop: 10, display: "flex" }}>
                  <Input.Password
                    placeholder="Enter key"
                    onChange={(e) => setUnlockKey(e.target.value)}
                    maxLength={6}
                    style={{ width: 120 }}
                  />
                  <Button
                    type="primary"
                    onClick={handleUnlockPassword}
                    style={{ marginLeft: 10 }}
                  >
                    🔓
                  </Button>
                </div>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {selectedAccount.email}
            </Descriptions.Item>
            <Descriptions.Item label="Phone">
              {selectedAccount.phone}
            </Descriptions.Item>
            <Descriptions.Item label="Note">
              {selectedAccount.note}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
      {/* 🛠️ Modal cập nhật account */}
      <Modal
        title="Update Account"
        open={isUpdateModalOpen}
        onCancel={() => setIsUpdateModalOpen(false)}
        onOk={handleSaveUpdate}
      >
        {editingAccount && (
          <div>
            <Input
              value={editingAccount.name}
              onChange={(e) =>
                setEditingAccount({ ...editingAccount, name: e.target.value })
              }
              placeholder="Name"
              style={{ marginBottom: 10 }}
            />
            <Input
              value={editingAccount.username}
              onChange={(e) =>
                setEditingAccount({
                  ...editingAccount,
                  username: e.target.value,
                })
              }
              placeholder="Username"
              style={{ marginBottom: 10 }}
            />
            <Input
              value={editingAccount.email}
              onChange={(e) =>
                setEditingAccount({ ...editingAccount, email: e.target.value })
              }
              placeholder="Email"
              style={{ marginBottom: 10 }}
            />
            <Input
              value={editingAccount.phone}
              onChange={(e) =>
                setEditingAccount({ ...editingAccount, phone: e.target.value })
              }
              placeholder="Phone"
              style={{ marginBottom: 10 }}
            />
            <Input.TextArea
              value={editingAccount.note}
              onChange={(e) =>
                setEditingAccount({ ...editingAccount, note: e.target.value })
              }
              placeholder="Note"
              style={{ marginBottom: 10 }}
            />

            {/* 🛡️ Trường mật khẩu */}
            <div style={{ marginBottom: 10 }}>
              <span>Password: </span>
              {updatePasswordVisible ? (
                <Input.Password
                  value={editingAccount.password}
                  onChange={(e) =>
                    setEditingAccount({
                      ...editingAccount,
                      password: e.target.value,
                    })
                  }
                  placeholder="New Password (Leave empty if not changing)"
                  style={{ width: "100%" }}
                />
              ) : (
                <span> • • • • • • </span>
              )}
            </div>

            {/* 🔐 Nhập key để mở khóa mật khẩu */}
            {!updatePasswordVisible && (
              <div style={{ marginBottom: 10 }}>
                <Input.Password
                  placeholder="Enter key"
                  onChange={(e) => setUpdateUnlockKey(e.target.value)}
                  maxLength={6}
                  style={{ width: 120 }}
                />
                <Button
                  type="primary"
                  onClick={handleUnlockUpdatePassword}
                  style={{ marginLeft: 10 }}
                >
                  🔓 Unlock
                </Button>
              </div>
            )}

            {/* 🔑 Nếu thay đổi password, yêu cầu nhập mật khẩu hiện tại */}
            {editingAccount.password && updatePasswordVisible && (
              <Input.Password
                value={updatePassword}
                onChange={(e) => setUpdatePassword(e.target.value)}
                placeholder="Enter current password to confirm"
                style={{ marginBottom: 10 }}
              />
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
