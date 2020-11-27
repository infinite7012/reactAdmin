import React, { Component } from 'react'
import { Link, withRouter } from 'react-router-dom'
import './index.less'
import logo from '../../assets/images/logo.png'
import { Menu } from 'antd';
import menuList from '../../config/menuConfig.js'
import memoryUtils from '../../utils/memoryUtils';
const { SubMenu } = Menu;

class LeftNav extends Component {
    componentWillMount() {
        this.menuNodes = this.getMenuNodes(menuList)
    }
    hasAuth = (item) => {
        const { key, isPublic } = item
        const menus=memoryUtils.user.role.menus
        const username=memoryUtils.user.username
        /*
    1. 如果当前用户是admin
    2. 如果当前item是公开的
    3. 当前用户有此item的权限: key有没有menus中
     */
    if(username==='admin'||isPublic||menus.indexOf(key)!==-1){
        return true
    }else if(item.children)//4. 如果当前用户有此item的某个子item的权限
    {
        return !!item.children.find(child=>menus.indexOf(child.key)!==-1)
    }
        return false
    }
    getMenuNodes = (menuList) => {
        return menuList.map(item => {
            if (this.hasAuth(item)) {
                if (!item.children) {
                    return (
                        <Menu.Item key={item.key} icon={item.icon}>
                            <Link to={item.key}>
                                <span>{item.title}</span>
                            </Link>
                        </Menu.Item>
                    )
                }
                else {
                    const path = this.props.location.pathname
                    const cItem = item.children.find(cItem => path.indexOf(cItem.key) === 0)
                    if (cItem) {
                        this.openKey = item.key
                    }
                    return (
                        <SubMenu key={item.key} icon={item.icon} title={item.title}>
                            { this.getMenuNodes(item.children)}
                        </SubMenu>
                    )
                }
            }
        })
    }
    render() {
        let path = this.props.location.pathname
        if (path.indexOf('/product') === 0) { // 当前请求的是商品或其子路由界面
            path = '/product'
        }

        const openKey = this.openKey
        return (
            <div className='left-nav'>
                <Link to='/' className='left-nav-header'>
                    <img src={logo} alt="logo" />
                    <h1>硅谷后台</h1>
                </Link>

                <Menu
                    mode="inline"
                    theme="dark"
                    selectedKeys={[path]}
                    defaultOpenKeys={[openKey]}
                >
                    {
                        this.menuNodes
                    }
                </Menu>
            </div>
        )
    }
}
export default withRouter(LeftNav)