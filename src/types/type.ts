

export type TypeCategory = {
    _id?: string,
    category_name: string,
    description?: string,
    slug?: string,
    banner?: string
}
export type TypeProduct = {
    _id?: string;
    product_name: string;
    price: number;
    discount?: number;
    stock?: number;
    category?: string;
    description?: string;
    origin?: string;
    thumbnail?: string;
    gallery?: string;  // Đảm bảo gallery là mảng string
    isBest?: boolean;
    isNewProduct?: boolean;
    isShowHome?: boolean;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    unit?: ProductUnit, // đơn vị
}
export type TypeStaff = {
    _id: string,
    fullName: string,
    phone: string,
    email: string,
    password: string,
    active: boolean,
    role: EnumRole,
    createdAt?: Date;
    updatedAt?: Date;
}
export type TypeCustomer = {
    _id: string,
    fullName: string,
    phone: string,
    email: string,
    password: string,
    address?: string,
    active: boolean,
}
export type TypeOrderItem = {
    product: {
      _id: string;
      thumbnail?: string;
    };
    product_name: string;
    quantity: number;
    price: number;
    discount: number;
}
export type TypeOrder = {
    _id: string,
    order_code?: string,// mã đơn hàng
    customer: {
        _id: string,
        fullName: string,
        phone: string,
        email: string,
        password: string,
        address?: string,
    },
    payment_type?: number,// loại thanh toán
    payment_status?: number,// trạng thái thanh toán
    status?: number,// trạng thái đơn hàng
    shipping_address?: string,// địa chỉ giao hàng
    tracking_number?: string,// số điện thoại giao hàng
    shipping_fee: number,// phí vận chuyển
    note?: string,// ghi chú
    order_items: TypeOrderItem[],
    total_amount: number,
    cancelled_reason?: string,// lý do hủy đơn
    cancelled_at?: Date,// thời gian hủy đơn
    delivered_at?: Date,// thời gian giao hàng
    createdAt: Date | string ;
    updatedAt?: Date | string;
}
export enum EnumRole {
    ADMIN = 'admin',     // Full quyền (xem, thêm, sửa, xóa)
    USER = 'user',       // Quyền hạn chế (xem, thêm, sửa)
    VIEWER = 'viewer'    // Chỉ xem
}
// đơn vị sản phẩm
export enum ProductUnit {
    KG = 'kg',
    GRAM = 'gram',
    BUNCH = 'bó',
    PACK = 'gói',
    OTHER = 'khác'
}

export type TypeMainvs = {
    _id?: string,
    images?: string[]
}

export type TypeResume = {
    _id?: string,
    personalInfo: {
        avatar: string,
        fullName: string,
        birthday: string,
        email: string,
        phone: string,
        github: string,
        address: string,
    },
    education: [
        {
            institution: string, degree: string, year: string, detail: string
        }
    ],
    skills: [
        {
            nameSkill: string,
            percentage: number,
            detail: [{
                value: string
            }]
        }
    ]
    experience: [
        { company: string, 
            role: string, 
            duration: string, 
            description: string 
        }
    ],
    projects: [
        { 
            name: string,
            description: string, 
            link: string, 
            role: string,
            image: string
        }
    ],
    
}