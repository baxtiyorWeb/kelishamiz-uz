import { useQuery } from "react-query";
import { Button, DatePicker, Form, Input, Select, Space, Spin } from "antd";

import { Link } from "react-router-dom";
import { getRegions, getDistrictById } from "../../exports/api";
import useCreateUser from "../../hooks/useCreateUser";
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 14 },
  },
};
const CreateUser = () => {
  const { createUser, isPending, name, setName, id, setId } = useCreateUser();
  const { data: regions } = useQuery({
    queryKey: ["region", id],
    queryFn: () => getRegions(),
  });

  const { data: districts, isLoading } = useQuery({
    queryKey: ["district", id],
    queryFn: () => getDistrictById(id),
    enabled: !!id,
  });

  return (
    <Form {...formItemLayout} variant="filled" className="">
      <h1 className="text mb-5 text-center text-lg">
        Ma&apos;lumotingizni to&apos;ldiring
      </h1>
      <Form.Item
        label="Ism"
        name="ism kiriting"
        rules={[
          {
            required: true,
            message: "ismingizni kiriting!",
          },
        ]}
      >
        <Input
          className="w-[280px]"
          onChange={(e) => setName({ ...name, firstName: e.target.value })}
        />
      </Form.Item>

      <Form.Item
        label="Familiya"
        name="familiyangizni kiriting"
        rules={[
          {
            required: true,
            message: "familiyangizni kiriting",
          },
        ]}
      >
        <Input
          className="w-[280px]"
          onChange={(e) => setName({ ...name, lastName: e.target.value })}
        />
      </Form.Item>
      <Form.Item
        label="Otangizning ismingiz"
        name="ikkinchi ism ni kiriting"
        rules={[
          {
            required: true,
            message: "Please enter your secondName!",
          },
        ]}
      >
        <Input
          className="w-[280px]"
          onChange={(e) => setName({ ...name, secondName: e.target.value })}
        />
      </Form.Item>

      <Form.Item
        label="Tug'ilgan sana"
        name="tug'ilgan sanangizni kiriting"
        rules={[
          {
            required: true,
            message: "tug'ilgan sanangizni kiriting",
          },
        ]}
      >
        <DatePicker
          className="w-[280px]"
          onChange={(e) =>
            setName({ ...name, birthDate: e.format("YYYY-MM-DD") })
          }
        />
      </Form.Item>

      <Form.Item
        label="Viloyat"
        name="Viloyat kiriting"
        rules={[
          {
            required: true,
            message: "Viloyatingizni kiriting",
          },
        ]}
      >
        <Select className="w-[280px]" onChange={(e) => setId(e)}>
          {regions?.data?.map((item, index) => (
            <Select.Option value={item?.id} key={index}>
              {item?.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      {isLoading ? (
        "..."
      ) : (
        <Form.Item
          label="Tuman"
          name="tumaningzni kiriting"
          rules={[
            {
              required: true,
              message: "tumaningzni kiriting",
            },
          ]}
        >
          <Select
            className="w-[280px]"
            onChange={(e) => setName({ ...name, districtId: e })}
          >
            {districts?.data?.map((item, index) => (
              <Select.Option key={index} value={item?.id}>
                {item?.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      )}
      <Form.Item
        label="Manzil"
        name="Manzilingizni kiriting"
        rules={[
          {
            required: true,
            message: "Manzilingizni kiriting",
          },
        ]}
      >
        <Input
          className="w-[280px]"
          onChange={(e) => setName({ ...name, address: e.target.value })}
        />
      </Form.Item>

      <Form.Item>
        <Space className="flex w-[400px] items-center justify-between  pl-24">
          <Button onClick={() => createUser()}>
            {isPending ? <Spin /> : "kiritish"}
          </Button>
          <Link className="text underline " onClick={() => createUser()}>
            O&apos;tkazib yuborish
          </Link>
        </Space>
      </Form.Item>
    </Form>
  );
};
export default CreateUser;
