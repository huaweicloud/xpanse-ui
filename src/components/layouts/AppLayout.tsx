/*
 * SPDX-License-Identifier: Apache-2.0
 * SPDX-FileCopyrightText: Huawei Inc.
 */

import { Layout } from 'antd';
import React from 'react';
import { env } from '../../config/config.ts';
import appStyles from '../../styles/app.module.css';
import { updateApiConfig } from '../../xpanse-api/CustomOpenApiConfig.ts';
import LayoutFooter from './footer/LayoutFooter.tsx';
import AuthLayoutHeader from './header/AuthLayoutHeader.tsx';
import NoAuthLayoutHeader from './header/NoAuthLayoutHeader.tsx';
import LayoutSider from './sider/LayoutSider.tsx';

export default function AppLayout({ children }: { children: React.JSX.Element }): React.JSX.Element {
    if (env.VITE_APP_AUTH_DISABLED !== 'true') {
        updateApiConfig();
    }
    return (
        <Layout className={appStyles.layout} hasSider={true}>
            <LayoutSider />
            <Layout>
                {env.VITE_APP_AUTH_DISABLED === 'true' ? <NoAuthLayoutHeader /> : <AuthLayoutHeader />}
                <Layout.Content className={appStyles.siteLayout}>
                    <div className={appStyles.siteLayoutBackground}>{children}</div>
                </Layout.Content>
                <LayoutFooter />
            </Layout>
        </Layout>
    );
}
