import {useState, useEffect, useRef} from 'react';
import { globalSetting } from '../../constants/configs';
import { axiosClient } from '../../library/axiosClient';
import { useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import { useNavigate,useParams} from 'react-router-dom';
import {Form,InputNumber,Input,Switch,message,Button, Select,Upload} from 'antd';
import { CheckOutlined, CloseOutlined,UploadOutlined } from '@ant-design/icons';
import type { FormProps,UploadProps} from 'antd';
import { TypeProduct, TypeCategory, ProductUnit } from '../../types/type';

// ckeditor
import { CKEditor } from '@ckeditor/ckeditor5-react';
import type { EditorConfig } from '@ckeditor/ckeditor5-core';
import {
	ClassicEditor,
	AccessibilityHelp,
	Alignment,
	Autoformat,
	AutoImage,
	Autosave,
	Bold,
	Essentials,
	FindAndReplace,
	FontBackgroundColor,
	FontColor,
	FontFamily,
	FontSize,
	GeneralHtmlSupport,
	Heading,
	Highlight,
	HtmlComment,
	HtmlEmbed,
	Italic,
	Link,
	List,
	ListProperties,
	Paragraph,
	RemoveFormat,
	SelectAll,
	ShowBlocks,
	SimpleUploadAdapter,
	SourceEditing,
	SpecialCharacters,
	SpecialCharactersArrows,
	SpecialCharactersCurrency,
	SpecialCharactersEssentials,
	SpecialCharactersLatin,
	SpecialCharactersMathematical,
	SpecialCharactersText,
	Strikethrough,
	Table,
	TableCaption,
	TableCellProperties,
	TableColumnResize,
	TableProperties,
	TableToolbar,
	TextTransformation,
	Underline,
	Undo
} from 'ckeditor5';

import 'ckeditor5/ckeditor5.css';
const EditProduct = () => {
    // start ckeditor
	const editorRef = useRef(null);
    const [isLayoutReady, setIsLayoutReady] = useState(false);
    const [textEditor, setTextEditor] = useState("");
    
    const editorConfig: EditorConfig = {
        simpleUpload: {
            uploadUrl: `${globalSetting.URL_API}/upload/photos`,
        },
            toolbar: {
                items: [
                    'undo',
                    'redo',
                    '|',
                    'sourceEditing',
                    'showBlocks',
                    'findAndReplace',
                    'selectAll',
                    '|',
                    'heading',
                    '|',
                    'fontSize',
                    'fontFamily',
                    'fontColor',
                    'fontBackgroundColor',
                    '|',
                    'bold',
                    'italic',
                    'underline',
                    'strikethrough',
                    'removeFormat',
                    '|',
                    'specialCharacters',
                    'link',
                    'insertImage',
                    'insertTable',
                    'highlight',
                    'htmlEmbed',
                    '|',
                    'alignment',
                    '|',
                    'bulletedList',
                    'numberedList',
                    '|',
                    'accessibilityHelp'
                ],
                shouldNotGroupWhenFull: false
            },
            plugins: [
                AccessibilityHelp,
                Alignment,
                Autoformat,
                AutoImage,
                Autosave,
                Bold,
                Essentials,
                FindAndReplace,
                FontBackgroundColor,
                FontColor,
                FontFamily,
                FontSize,
                GeneralHtmlSupport,
                Heading,
                Highlight,
                HtmlComment,
                HtmlEmbed,
                Italic,
                Link,
                List,
                ListProperties,
                Paragraph,
                RemoveFormat,
                SelectAll,
                ShowBlocks,
                SimpleUploadAdapter,
                SourceEditing,
                SpecialCharacters,
                SpecialCharactersArrows,
                SpecialCharactersCurrency,
                SpecialCharactersEssentials,
                SpecialCharactersLatin,
                SpecialCharactersMathematical,
                SpecialCharactersText,
                Strikethrough,
                Table,
                TableCaption,
                TableCellProperties,
                TableColumnResize,
                TableProperties,
                TableToolbar,
                TextTransformation,
                Underline,
                Undo
            ],
            fontFamily: {
                supportAllValues: true
            },
            fontSize: {
                options: [10, 12, 14, 'default', 18, 20, 22],
                supportAllValues: true
            },
            heading: {
                options: [
                    { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
                    { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
                    { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
                    { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
                    { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' },
                    { model: 'heading5', view: 'h5', title: 'Heading 5', class: 'ck-heading_heading5' },
                    { model: 'heading6', view: 'h6', title: 'Heading 6', class: 'ck-heading_heading6' }
                ]
            },
            htmlSupport: {
                allow: [
                    {
                        name: /^.*$/,
                        styles: true,
                        attributes: true,
                        classes: true
                    }
                ]
            },
            link: {
                addTargetToExternalLinks: true,
                defaultProtocol: 'https://',
                decorators: {
                    toggleDownloadable: {
                        mode: 'manual',
                        label: 'Downloadable',
                        attributes: {
                            download: 'file'
                        }
                    }
                }
            },
            list: {
                properties: {
                    styles: true,
                    startIndex: true,
                    reversed: true
                }
            },
            placeholder: 'Type or paste your content here!',
            table: {
                contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties']
            }
    };
    useEffect(() => {
        setIsLayoutReady(true);

        return () => setIsLayoutReady(false);
    }, []);
    // end ckeditor
    const navigate = useNavigate();
    const params = useParams();
    const { id } = params;
    const queryClient = useQueryClient();
    const [formUpdate] = Form.useForm();
    // b1: render dữ liệu lấy theo id ở params
    const getProduct = async () => {
        const url = `${globalSetting.URL_API}/products/${id}`;
        const res = await axiosClient.get(url);
        return res.data.data;
    };
    //Lấy danh sách product về theo id
    const queryProduct = useQuery({
        queryKey: ["products-update",id],
        queryFn: getProduct,
        
    });
    // xử lý dữ liệu khi dùng ckeditor
    useEffect(() => {
        if (queryProduct.isSuccess && queryProduct.data) {
            formUpdate.setFieldsValue(queryProduct.data);
            setTextEditor(queryProduct.data.description);
        }
    }, [queryProduct.isSuccess, queryProduct.data, formUpdate]);
    // render dữ liệu vào form (chú ý name trong form item === name item)
    
    // b2: thực hiện update khi có sự thay đổi
    const fetchUpdateProduct = async (formData: TypeProduct) => {
        const url = `${globalSetting.URL_API}/products/${id}`;
        const res = await axiosClient.put(url,formData);
        return res.data.data;
    };
    //============== get category ============= //
    const fetchCategoryProduct = async() => {
        const url = `${globalSetting.URL_API}/categories`;
        const res = await axiosClient.get(url);
        return res.data.data;
    }
    const getCategoryProduct = useQuery({
        queryKey: ['categories'],
        queryFn: fetchCategoryProduct
    })
    //============== end get category ============= //
    //============== edit upload image ============= //
    const propsUploadSingle: UploadProps = {
        action: `${globalSetting.URL_API}/upload/photo`,
        listType: 'picture',
        maxCount: 1,
        onChange: (file) => {
          // Kiểm tra xem việc upload có thành công không
          if (file.file.status === 'done') {
            const imageUrl = file.file.response.data.link;
            formUpdate.setFieldValue('thumbnail', imageUrl); // Cập nhật giá trị của input thumbnail
          }
        },
        onRemove: () => {
          formUpdate.setFieldValue('thumbnail', null); // Clear giá trị khỏi input thumbnail
          // Gọi API xóa hình ảnh trên server (cần thêm API thực hiện việc này)
        },
    };
    //============== end edit upload image ============= //
    const updateMutationCategory = useMutation({
        mutationFn: fetchUpdateProduct,
        onSuccess: () => {
            // reset lại dữ liệu
            queryClient.invalidateQueries({
                queryKey: ['products']
            })
            message.success('Cập nhật thành công!');
            formUpdate.resetFields();
        },
        onError: () => {
            message.error('Cập nhật lỗi!')
        }
    })
    
    const onFinishEdit: FormProps<TypeProduct>['onFinish'] = async (values) => {
        updateMutationCategory.mutate(values);
    };
    
    const onFinishFailedEdit: FormProps<TypeProduct>['onFinishFailed'] = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };
    const handleOkEdit = () => {
        formUpdate.submit();
        navigate('/products')
    };
    return (
        <div className='sec_edit'>
            <h2>Cập nhật sản phẩm</h2>
            <Form
                name="formEdit"
                onFinish={onFinishEdit}
                onFinishFailed={onFinishFailedEdit}
                autoComplete="off"
                form={formUpdate}
                className='form_edit'
                layout="vertical"
                >
                <Form.Item
                label="id"
                name="_id"
                hidden={true}
                >
                <Input type="hidden" />
                </Form.Item>
                <div className="form_edit_item">
                    <div className="form_edit_ttl">
                        <h3>Hình ảnh nổi bật</h3>
                    </div>
                    <div className="form_edit_content">
                        <Form.Item label="Hình ảnh" name="thumbnail">
                            <Input />
                        </Form.Item>
                        <Form.Item<TypeProduct>
                            label=""
                            name="thumbnail"
                        >
                        <Upload {...propsUploadSingle} >
                        <Button icon={<UploadOutlined />}>Tải hình ảnh</Button>
                        </Upload>
                        </Form.Item>
                    </div>
                </div>
                <div className="form_edit_item">
                    <div className="form_edit_ttl">
                        <h3>Thông tin sản phẩm</h3>
                    </div>
                    <div className="form_edit_content">
                        <Form.Item
                            label="Tên sản phẩm"
                            name="product_name"
                            hasFeedback
                            rules={[
                                {required: true, message: "Vui lòng nhập tên sản phẩm!" },
                                ]}
                            >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            label="Giá/Kg(VNĐ)"
                            name="price"
                            >
                            <InputNumber 
                            min={0} 
                            style={{ width: '100%' }} 
                            />
                        </Form.Item>
                        <Form.Item
                            label="Khuyến mãi(nếu có)"
                            name="discount"
                            hasFeedback
                            >
                            <InputNumber 
                            min={0} 
                            max={100} 
                            style={{ width: '100%' }} 
                            />
                        </Form.Item>
                        <Form.Item
                            label="Số lượng sản phẩm tồn kho"
                            name="stock"
                            >
                            <InputNumber 
                            min={0} 
                            style={{ width: '100%' }} 
                            />
                        </Form.Item>
                        <Form.Item
                            label="Xuất xứ sản phẩm"
                            name="origin"

                            >
                            <Input 
                            />
                        </Form.Item>
                        <Form.Item
                        label="Đơn vị tính"
                        name="unit"
                    >
                        <Select style={{ width: '100%' }}>
                            {Object.values(ProductUnit).map((unit) => (
                                <Select.Option key={unit} value={unit}>
                                    {unit}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    </div>
                </div>
                <div className="form_edit_item">
                    <div className="form_edit_ttl">
                        <h3>Mô tả chi tiết sản phẩm</h3>
                    </div>
                    <div className="form_edit_content">
                        <Form.Item
                            label=""
                            name="description"
                            className='ckeditor_content'
                            >
                            <div ref={editorRef}>
                                {isLayoutReady && <CKEditor 
                                editor={ClassicEditor} 
                                config={editorConfig}
                                data={textEditor}
                                onChange={(_, editor) => {
                                    const data = editor.getData();
                                    formUpdate.setFieldValue('description',data);
                                }}
                                />}
                            </div>
                        </Form.Item>      
                    </div>
                </div>
                <div className="form_edit_item">
                    <div className="form_edit_ttl">
                        <h3>Danh mục sản phẩm</h3>
                    </div>
                    <div className="form_edit_content">
                    <Form.Item<TypeProduct>
                    name="category"
                    >
                    <Select
                        style={{ width: '100%' }}
                        options={
                            getCategoryProduct?.data &&
                            getCategoryProduct?.data.categories_list.map((c: TypeCategory) => {
                            return {
                                key: c._id,
                                value: c._id,
                                label: c.category_name,
                            };
                            })
                        }
                        />
                        </Form.Item>
                    </div>
                </div>
                <div className="form_edit_item">
                    <div className="form_edit_ttl">
                        <h3>Tuỳ chọn</h3>
                    </div>
                    <div className="form_edit_content">
                        <Form.Item
                        label="Trạng thái"
                        name="isActive"
                        valuePropName="checked"
                        initialValue={false}
                        >
                        <Switch
                            checkedChildren={<CheckOutlined />}
                            unCheckedChildren={<CloseOutlined />}
                            defaultChecked
                            />
                        </Form.Item>
                        <Form.Item
                        label="Sản phẩm nổi bật"
                        name="isBest"
                        valuePropName="checked"
                        initialValue={false}
                        >
                        <Switch
                            checkedChildren={<CheckOutlined />}
                            unCheckedChildren={<CloseOutlined />}
                            defaultChecked
                            />
                        </Form.Item>
                        <Form.Item
                        label="Sản phẩm mới"
                        name="isNewProduct"
                        valuePropName="checked"
                        initialValue={false}
                        >
                        <Switch
                            checkedChildren={<CheckOutlined />}
                            unCheckedChildren={<CloseOutlined />}
                            defaultChecked
                            />
                        </Form.Item>
                        <Form.Item
                        label="Hiển thị trang chủ"
                        name="isShowHome"
                        valuePropName="checked"
                        initialValue={false}
                        >
                        <Switch
                            checkedChildren={<CheckOutlined />}
                            unCheckedChildren={<CloseOutlined />}
                            defaultChecked
                            />
                        </Form.Item>
                    </div>
                </div>
                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        className='common_button'
                        onClick= {handleOkEdit}
                    >
                        Cập nhật
                    </Button>
                </Form.Item>
            </Form>
        </div>
    )
}

export default EditProduct