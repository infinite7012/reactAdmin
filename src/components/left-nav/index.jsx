import React, { Component } from 'react'
import { Link, withRouter} from 'react-router-dom'
import './index.less'
import logo from '../../assets/images/logo.png'
import { Menu } from 'antd';
import menuList from '../../config/menuConfig.js'
const { SubMenu } = Menu;

class LeftNav extends Component {
    componentWillMount(){
        this.menuNodes=this.getMenuNodes(menuList)
    }
    getMenuNodes = (menuList) => {
        return menuList.map(item => {
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
                const path=this.props.location.pathname
                const cItem=item.children.find(cItem=>cItem.key===path)
                if(cItem){
                    this.openKey=item.key
                }
                return (
                    <SubMenu key={item.key} icon={item.icon} title={item.title}>
                        { this.getMenuNodes(item.children)}
                    </SubMenu>
                )
            }
        })
    }
    render() {
        const path=this.props.location.pathname
        const openKey=this.openKey
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