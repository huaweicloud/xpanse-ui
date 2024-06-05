/*
 * SPDX-License-Identifier: Apache-2.0
 * SPDX-FileCopyrightText: Huawei Inc.
 */

import { useQueryClient } from '@tanstack/react-query';
import { Alert } from 'antd';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError, Response, ServiceTemplateDetailVo } from '../../../../../xpanse-api/generated';
import { catalogPageRoute } from '../../../../utils/constants';
import { getQueryKey } from '../query/useAvailableServiceTemplatesQuery';
import { useGetDeleteMutationState } from './DeleteServiceMutation';

export function DeleteResult({
    id,
    category,
}: {
    id: string;
    category: ServiceTemplateDetailVo.category;
}): React.JSX.Element | undefined {
    const deleteRequestState = useGetDeleteMutationState(id);
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const onRemove = () => {
        void queryClient.refetchQueries({ queryKey: getQueryKey(category) });
        navigate({
            pathname: catalogPageRoute,
            hash: '#' + category,
        });
    };

    if (deleteRequestState[0]) {
        if (deleteRequestState[0].status === 'success') {
            return (
                <Alert
                    message='Service Deleted Successfully'
                    description={'Service removed from the database completely.'}
                    showIcon
                    type={'success'}
                    closable={true}
                    onClose={onRemove}
                />
            );
        }

        if (deleteRequestState[0].status === 'error') {
            if (deleteRequestState[0].error) {
                return (
                    <div>
                        {deleteRequestState[0].error instanceof ApiError &&
                        deleteRequestState[0].error.body &&
                        'details' in deleteRequestState[0].error.body ? (
                            <Alert
                                message='Delete Request Failed'
                                description={(deleteRequestState[0].error.body as Response).details}
                                showIcon
                                type={'error'}
                                closable={true}
                                onClose={onRemove}
                            />
                        ) : (
                            <Alert
                                message='Delete Request Failed'
                                description={deleteRequestState[0].error.message}
                                showIcon
                                type={'error'}
                                closable={true}
                                onClose={onRemove}
                            />
                        )}
                    </div>
                );
            }
        }
    }
}
