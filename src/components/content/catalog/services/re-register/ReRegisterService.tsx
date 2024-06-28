/*
 * SPDX-License-Identifier: Apache-2.0
 * SPDX-FileCopyrightText: Huawei Inc.
 */

import { PlusCircleOutlined } from '@ant-design/icons';
import { Button, Popconfirm } from 'antd';
import catalogStyles from '../../../../../styles/catalog.module.css';
import { serviceRegistrationState } from '../../../../../xpanse-api/generated';
import { useReRegisterRequest } from './ReRegisterMutation';

function ReRegisterService({
    id,
    setIsViewDisabled,
    isReRegisterDisabled,
    setIsDeleteDisabled,
    serviceRegistrationStatus,
}: {
    id: string;
    setIsViewDisabled: (isViewDisabled: boolean) => void;
    isReRegisterDisabled: boolean;
    setIsDeleteDisabled: (isDelete: boolean) => void;
    serviceRegistrationStatus: string;
}): React.JSX.Element {
    const reRegisterRequest = useReRegisterRequest(id);
    if (reRegisterRequest.isSuccess) {
        setIsDeleteDisabled(true);
    }
    const reRegister = () => {
        setIsViewDisabled(true);
        reRegisterRequest.mutate();
    };

    return (
        <div className={catalogStyles.updateUnregisterBtnClass}>
            <Popconfirm
                title='re-register the service'
                description='Are you sure to re-register this service?'
                cancelText='Yes'
                okText='No'
                onCancel={() => {
                    reRegister();
                }}
            >
                <Button
                    icon={<PlusCircleOutlined />}
                    type='primary'
                    className={catalogStyles.catalogManageBtnClass}
                    disabled={
                        reRegisterRequest.isSuccess ||
                        isReRegisterDisabled ||
                        serviceRegistrationStatus !== serviceRegistrationState.UNREGISTERED.toString()
                    }
                >
                    Re-register
                </Button>
            </Popconfirm>
        </div>
    );
}

export default ReRegisterService;
