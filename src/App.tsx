import React, { useState } from "react";
import {
  Layout,
  Input,
  Button,
  Card,
  Typography,
  Tag,
  Spin,
  message,
  Row,
  Col,
  Modal,
  Steps,
  Divider,
  ConfigProvider,
  Empty,
} from "antd";
import {
  CoffeeOutlined, // Dùng icon này thay cho Robot
  UnorderedListOutlined,
  FireOutlined,
  ReadOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import axios from "axios"; // Đảm bảo bạn đã cài axios
import "./App.css"; // Import CSS mới

// --- Types & API (Có thể tách file, nhưng để ở đây cho tiện copy) ---
export interface Ingredient {
  item: string;
  amount: string;
}

export interface Dish {
  name: string;
  description: string;
  ingredients: Ingredient[];
  steps: string[];
  calories?: string;
}

export interface MenuResponse {
  title: string;
  dishes: Dish[];
}

const API_ENDPOINT = "https://groqprompt.netlify.app/api/ai";

const generateMenu = async (userRequest: string): Promise<MenuResponse> => {
  const systemPrompt = `
    Bạn là bếp trưởng 5 sao. Hãy gợi ý thực đơn hấp dẫn và hướng dẫn nấu dựa trên yêu cầu: "${userRequest}".
    
    Yêu cầu output: JSON hợp lệ. Ngôn ngữ: Tiếng Việt thân mật, cảm xúc.
    Cấu trúc:
    {
      "title": "Tên thực đơn thật kêu (Ví dụ: Bữa Tối Ấm Cúng)",
      "dishes": [
        {
          "name": "Tên món",
          "description": "Mô tả ngắn gọn nhưng kích thích vị giác (dưới 20 từ)",
          "calories": "xxx kcal",
          "ingredients": [
            { "item": "Tên nguyên liệu", "amount": "Số lượng" }
          ],
          "steps": [
            "Bước 1: Làm gì...", "Bước 2: Làm gì..."
          ]
        }
      ]
    }
  `;

  try {
    const response = await axios.post(API_ENDPOINT, { prompt: systemPrompt });
    const responseData = response.data;
    if (responseData && responseData.result) {
      return JSON.parse(responseData.result);
    } else {
      throw new Error("Invalid AI format");
    }
  } catch (error) {
    throw error;
  }
};

// --- Main Component ---
const { Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const [menuData, setMenuData] = useState<MenuResponse | null>(null);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleGenerate = async () => {
    if (!input.trim()) {
      message.warning("Bếp trưởng chưa biết bạn muốn ăn gì nè!");
      return;
    }
    setLoading(true);
    setMenuData(null);
    try {
      const result = await generateMenu(input);
      setMenuData(result);
      message.success("Thực đơn đã sẵn sàng!");
    } catch (error) {
      message.error("Bếp đang quá tải, vui lòng thử lại sau chút xíu!");
    } finally {
      setLoading(false);
    }
  };

  const showDishDetails = (dish: Dish) => {
    setSelectedDish(dish);
    setIsModalOpen(true);
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#fa541c", // Màu cam chủ đạo (Volcano)
          borderRadius: 16, // Bo góc mềm mại
          fontFamily: "'Nunito', sans-serif",
          colorBgContainer: "#ffffff",
        },
      }}
    >
      <Layout style={{ minHeight: "100vh", background: "transparent" }}>
        {/* 1. Hero Section */}
        <div className="hero-section">
          <CoffeeOutlined
            style={{ fontSize: 48, color: "#fff", marginBottom: 10 }}
          />
          <Title level={1} className="hero-title">
            Bếp Nhà AI
          </Title>
          <Text className="hero-subtitle">
            Hôm nay ăn gì? Để AI gợi ý thực đơn chuẩn vị mẹ nấu.
          </Text>
        </div>

        <Content style={{ padding: "0 20px 40px" }}>
          <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            {/* 2. Search Box Area */}
            <Card className="search-card" bordered={false}>
              <Title level={4} style={{ marginTop: 0, color: "#fa541c" }}>
                <FireOutlined /> Bạn đang thèm món gì?
              </Title>
              <TextArea
                rows={2}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ví dụ: Món nhậu cuối tuần, hoặc Tôi còn 2 quả trứng và ít hành tây..."
                style={{
                  marginBottom: 20,
                  fontSize: "16px",
                  background: "#fafafa",
                }}
                maxLength={200}
                showCount
              />
              <Button
                type="primary"
                size="large"
                onClick={handleGenerate}
                loading={loading}
                block
                style={{
                  height: "50px",
                  fontSize: "18px",
                  fontWeight: 600,
                  boxShadow: "0 4px 14px 0 rgba(250, 84, 28, 0.39)",
                }}
              >
                {loading ? "Đang lên lửa..." : "Lên Thực Đơn Ngay"}
              </Button>
            </Card>

            {/* 3. Loading State */}
            {loading && (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <Spin size="large" />
                <div
                  style={{
                    marginTop: 20,
                    color: "#8c8c8c",
                    fontStyle: "italic",
                  }}
                >
                  Đang chọn nguyên liệu tươi ngon...
                </div>
              </div>
            )}

            {/* 4. Results Area */}
            {menuData && !loading && (
              <div style={{ marginTop: 40, animation: "fadeIn 0.5s ease-in" }}>
                <Divider style={{ borderColor: "#d9d9d9" }}>
                  <span
                    style={{
                      fontFamily: "Playfair Display",
                      fontSize: 24,
                      color: "#fa541c",
                    }}
                  >
                    {menuData.title}
                  </span>
                </Divider>

                <Row gutter={[24, 24]}>
                  {menuData.dishes.map((dish, index) => (
                    <Col xs={24} md={12} key={index}>
                      <Card
                        className="recipe-card"
                        hoverable
                        onClick={() => showDishDetails(dish)}
                        cover={
                          // Giả lập ảnh cover bằng màu gradient (hoặc thay bằng ảnh thật nếu có API ảnh)
                          <div
                            style={{
                              height: 6,
                              background: `linear-gradient(90deg, #ffc069 ${
                                index * 20
                              }%, #fa541c 100%)`,
                            }}
                          />
                        }
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "start",
                          }}
                        >
                          <Title
                            level={4}
                            style={{ margin: "0 0 10px 0", width: "70%" }}
                          >
                            {dish.name}
                          </Title>
                          <Tag color="volcano" style={{ marginRight: 0 }}>
                            {dish.calories}
                          </Tag>
                        </div>

                        <Paragraph
                          type="secondary"
                          ellipsis={{ rows: 2 }}
                          style={{ fontStyle: "italic", marginBottom: 15 }}
                        >
                          "{dish.description}"
                        </Paragraph>

                        <div
                          style={{
                            background: "#fff7e6",
                            padding: "10px",
                            borderRadius: "8px",
                          }}
                        >
                          <Text strong style={{ color: "#d4380d" }}>
                            <UnorderedListOutlined /> Nguyên liệu:
                          </Text>
                          <div style={{ marginTop: 5 }}>
                            {dish.ingredients.slice(0, 3).map((ing, i) => (
                              <Tag
                                key={i}
                                color="orange"
                                variant="filled"
                                style={{
                                  background: "#fff",
                                  border: "1px solid #ffd591",
                                }}
                              >
                                {ing.item}
                              </Tag>
                            ))}
                            {dish.ingredients.length > 3 && (
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                +{dish.ingredients.length - 3} loại khác
                              </Text>
                            )}
                          </div>
                        </div>

                        <Button
                          type="link"
                          style={{
                            paddingLeft: 0,
                            marginTop: 10,
                            fontWeight: 700,
                          }}
                        >
                          Xem công thức <ReadOutlined />
                        </Button>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>
            )}

            {!loading && !menuData && (
              <div style={{ marginTop: 60, textAlign: "center", opacity: 0.6 }}>
                <Empty
                  description="Sẵn sàng phục vụ bữa ăn của bạn"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              </div>
            )}
          </div>
        </Content>

        {/* 5. Modal Detail */}
        <Modal
          title={
            <span style={{ fontFamily: "Playfair Display", fontSize: 22 }}>
              {selectedDish?.name}
            </span>
          }
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={null}
          width={700}
          centered
          styles={{ body: { padding: "20px 0" } }}
        >
          {selectedDish && (
            <div style={{ padding: "0 10px" }}>
              <div
                style={{
                  background: "#fff7e6",
                  padding: "20px",
                  borderRadius: "12px",
                  marginBottom: 25,
                }}
              >
                <Title level={5} style={{ color: "#d4380d", marginTop: 0 }}>
                  <UnorderedListOutlined /> Nguyên liệu chuẩn bị
                </Title>
                <Row gutter={[12, 12]}>
                  {selectedDish.ingredients.map((item, idx) => (
                    <Col span={12} key={idx}>
                      <Text>
                        • <b>{item.item}</b>: {item.amount}
                      </Text>
                    </Col>
                  ))}
                </Row>
              </div>

              <Title level={5} style={{ color: "#d4380d" }}>
                <FireOutlined /> Các bước chế biến
              </Title>
              <Steps
                orientation="vertical"
                current={-1}
                items={selectedDish.steps.map((step, index) => ({
                  title: (
                    <span style={{ fontWeight: 700 }}>Bước {index + 1}</span>
                  ),
                  description: (
                    <span style={{ fontSize: 15, color: "#262626" }}>
                      {step}
                    </span>
                  ),
                  icon: <CheckCircleOutlined style={{ color: "#fa541c" }} />,
                }))}
              />

              <div style={{ textAlign: "center", marginTop: 30 }}>
                <Button
                  type="primary"
                  size="large"
                  onClick={() => setIsModalOpen(false)}
                >
                  Đã hiểu, bắt tay vào nấu thôi!
                </Button>
              </div>
            </div>
          )}
        </Modal>

        <Footer
          style={{
            textAlign: "center",
            background: "transparent",
            color: "#8c8c8c",
          }}
        >
          AI Menu Chef ©{new Date().getFullYear()} - Hạnh phúc bắt đầu từ căn
          bếp
        </Footer>
      </Layout>
    </ConfigProvider>
  );
};

export default App;
