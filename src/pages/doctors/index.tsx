import { message } from 'antd';
import React, { useRef } from 'react';
import { useIntl, FormattedMessage } from 'umi';
import { PageContainer} from '@ant-design/pro-layout';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { FormValueType } from './components/UpdateForm';
import type { UserListItem } from './data.d';
import { queryUsers, removeUser } from './service';

/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const handleAdd = async (fields: UserListItem) => {
  const hide = message.loading('Добавление');
  try {
    // await addRule({ ...fields });
    hide();
    message.success('Добавление прошло успешно');
    return true;
  } catch (error) {
    hide();
    message.error('Добавление прошло неудачно, попробуйте еще раз');
    return false;
  }
};

/**
 * @en-US Update node
 * @zh-CN 更新节点
 *
 * @param fields
 */
const handleUpdate = async (fields: FormValueType) => {
  const hide = message.loading('Обновление');
  try {
    // await updateRule({
    //   name: fields.name,
    //   desc: fields.desc,
    //   key: fields.key,
    // });
    hide();

    message.success('Обновление прошло успешно');
    return true;
  } catch (error) {
    hide();
    message.error('Обновление прошло неудачно, попробуй еще раз');
    return false;
  }
};

/**
 *  Delete node
 * @zh-CN 删除节点
 *
 * @param selectedRows
 */
const handleRemove = async (selectedRows: UserListItem[]) => {
  const hide = message.loading('Удаление');

  if (!selectedRows) return true;

  try {
    await removeUser({
      user_id: selectedRows.map((row) => row.id),
    });

    hide();
    message.success('Удаление прошло успешно, обновляем список');
    return true;
  } catch (error) {
    hide();
    message.error('Удаление прошло неудачно, попробуйте еще раз');
    return false;
  }
};

const DoctorsList: React.FC = (props) => {
  /**
   * @en-US The pop-up window of the distribution update window
   * @zh-CN 分布更新窗口的弹窗
   * */
  const actionRef = useRef<ActionType>();
  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */

  const intl = useIntl();
  
  // если есть фото, то показываем в модальном окне информацию вместе с фото, иначе - без него
  const columns: ProColumns<UserListItem>[] = [ 
    {
      title: (
        <FormattedMessage
          id="pages.doctors.form.fullName"
          defaultMessage="full name"
        />
      ),
      dataIndex: 'full name',
      //tip: 'The rule name is the unique key',
      render: (dom, entity) => {
        return (
            `${entity.name} ${entity.surname}`
        );
      },
    },
    {
      title: (
        <FormattedMessage
          id="pages.doctors.form.jobTitle"
          defaultMessage="job title"
        />
      ),
      dataIndex: 'jobTitle',
    },
    {
      title: (
        <FormattedMessage
          id="pages.doctors.form.specialization"
          defaultMessage="specialization"
        />
      ),
      dataIndex: 'specialization',
    },
    {
      title: (
        <FormattedMessage
          id="pages.doctors.form.photo"
          defaultMessage="photo"
        />
      ),
      dataIndex: 'photo',
    }];

  return (
    <PageContainer>
      <ProTable<UserListItem>
        headerTitle={intl.formatMessage({
          id: 'pages.doctors.title',
          defaultMessage: 'User list',
        })}
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        request={(params, sorter, filter) => queryUsers({ ...params, sorter, filter })}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
      />
    </PageContainer>
  );
};

export default DoctorsList;
