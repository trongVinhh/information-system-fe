import React, { useState } from "react";
import { Form, Input, Select, Button, message, Card, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import NavBar from "../components/NavBar";
import { supabaseClient } from "../services/Supabase";
import { getUserId } from "../services/Storage";

const { Option } = Select;

export default function CreateAccount() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    const userId = getUserId();
    if (!userId) {
      message.error("❌ Không tìm thấy thông tin người dùng!");
      return;
    }

    setLoading(true);
    try {
      const id = crypto.randomUUID();
      const { data, error } = await supabaseClient
        .from("users_accounts")
        .insert([{id, ...values, userId }])
        .select()
        .single();

      if (error) {
        console.error("Create error:", error);
        message.error(`❌ Lỗi: ${error.message}`);
      } else {
        message.success("✅ Tạo tài khoản thành công!");
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      message.error("❌ Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <NavBar />
      <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
        <Card title="Tạo Tài Khoản" className="w-full max-w-lg shadow-lg">
          <Form layout="vertical" onFinish={handleSubmit}>
            <Form.Item label="Thể loại" name="type">
              <Select placeholder="Chọn thể loại">
                {[
                  "WORK",
                  "INFORMATION",
                  "SOCIAL",
                  "STUDY",
                  "FINANCE",
                  "ENTERTAINMENT",
                  "TECH",
                  "OTHER",
                ].map((type) => (
                  <Option key={type} value={type}>
                    {type}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Apps" name="name">
              <Input placeholder="Nhập tên ứng dụng" />
            </Form.Item>

            <Form.Item label="Tên đăng nhập" name="username">
              <Input placeholder="Nhập tên đăng nhập" />
            </Form.Item>

            <Form.Item label="Mật khẩu" name="password">
              <Input.Password placeholder="Nhập mật khẩu" />
            </Form.Item>

            <Form.Item label="Email" name="email">
              <Input type="email" placeholder="Nhập email" />
            </Form.Item>

            <Form.Item label="Số điện thoại" name="phone">
              <Input type="tel" placeholder="Nhập số điện thoại" />
            </Form.Item>

            <Form.Item label="Ghi chú" name="note">
              <Input.TextArea placeholder="Ghi chú thêm" rows={2} />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                disabled={loading}
              >
                {loading ? <Spin indicator={<LoadingOutlined />} /> : "Tạo tài khoản"}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
}
