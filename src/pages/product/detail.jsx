import React, { Component } from 'react'
import { Card, List } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons';
import { reqCategory } from '../../api/index'
import LinkButton from '../../components/link-button'
import { BASE_IMG_URL } from '../../utils/constants'
import './product.less'

const Item = List.Item
export default class ProductDetail extends Component {
    state = {
        cName1:'',
        cName2:''
    }
    async componentDidMount() {
        const { pCategoryId, categoryId } = this.props.location.state.product
        if (pCategoryId === '0') {
            const result = await reqCategory(categoryId)
            const cName1=result.data.name
            this.setState({cName1})
        }
        else {
            const results = await Promise.all([reqCategory(pCategoryId), reqCategory(categoryId)])
            const cName1 = results[0].data.name
            const cName2 = results[1].data.name
            this.setState({
                cName1,
                cName2  
            })
        }
    }

    render() {
        const { name, desc, price, imgs, detail } = this.props.location.state.product
        const { cName1, cName2 } = this.state
        const title = (
            <span>
                <LinkButton onClick={() => this.props.history.goBack()}>
                    <ArrowLeftOutlined />
                </LinkButton>
                <span>商品详情</span>
            </span>
        )
        return (
            <Card title={title} className='product-detail'>
                <List>
                    <Item>
                        <span className="left" style={{ width: '10%' }}>商品名称:</span>
                        <span style={{ width: '90%' }}>{name}</span>
                    </Item>
                    <Item>
                        <span className="left" style={{ width: '10%' }}>商品描述:</span>
                        <span style={{ width: '90%' }}>{desc}</span>
                    </Item>
                    <Item>
                        <span className="left" style={{ width: '10%' }}>商品价格:</span>
                        <span style={{ width: '90%' }}>{price}</span>
                    </Item>
                    <Item>
                        <span className="left" style={{ width: '10%' }}>所属分类:</span>
                        <span style={{ width: '90%' }}>
                            {cName1}{cName2 ? ' --> ' + cName2 : ''}
                        </span>
                    </Item>
                    <Item>
                        <span className="left" style={{ width: '10%' }}>商品图片:</span>
                        <span style={{ width: '90%' }}>
                            {imgs.map(img => (
                                <img
                                    key={img}
                                    src={BASE_IMG_URL + img}
                                    className="product-img"
                                    alt="img"
                                />
                            ))}
                        </span>
                    </Item>
                    <Item>
                        <span className="left" style={{ width: '10%' }}>商品详情:</span>
                        <span style={{ width: '90%' }} dangerouslySetInnerHTML={{ '__html': detail }}></span>
                    </Item>
                </List>
            </Card>
        )
    }
}
