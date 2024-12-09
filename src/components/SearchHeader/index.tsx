
import { Button, Form, Input, Space } from 'antd';
import styles from './SearchHeader.module.css';
const SearchHeader = () => {
  return (
    <div className={styles.search_form_header}>
        <Form
            name="search form"
            autoComplete="on"
            layout="inline"
            className='form_search'
			>
            <Form.Item
            label=""
            name="keyword"
            >
            <Input placeholder="Tìm kiếm" />
            </Form.Item>
            <Form.Item shouldUpdate labelCol={{offset: 2}}>
                    <Space>
                        <Button type="primary" htmlType="submit"
                        >
                            Tìm kiếm
                        </Button>
                        <Button type="default" htmlType="reset"
                        >
                            Reset
                        </Button>
                    </Space>
            </Form.Item>
			</Form>
    </div>
  )
}

export default SearchHeader