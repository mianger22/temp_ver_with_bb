import React from 'react';
import { ProFormSelect, ProFormDatePicker } from '@ant-design/pro-form';
import { Modal, Form, DatePicker } from 'antd';
import { ScheduleListItem } from '../data';
import { FormattedMessage } from 'umi';
import { queryOperators } from '../../Operators/service';

export type NewScheduleFormProps = {
    visible: boolean,
    onChangeVisible: (visible: boolean) => void,
    addHandler: (value: ScheduleListItem) => Promise<boolean>,
    reload: () => void,
    title: string
}

const NewScheduleForm: React.FC<NewScheduleFormProps> = (props) => {
    const [form] = Form.useForm();
    // const actionRef = useRef<ActionType>();

    // отслеживаем значение поля 
    const selectedDay = Form.useWatch('worked_at', form);
    // отслеживаем значение поля 
    const selectedUser = Form.useWatch('operator_id', form);

    return (
        <Form
            form={form} 
        >
            <Modal
                title={props.title}
                width="400px"
                visible={props.visible}
                onCancel={(e) => {
                    if (e.currentTarget.className === "ant-modal-close" || e.currentTarget.className === "ant-btn ant-btn-default") {
                        // когда кликнули только по крестику
                        props.onChangeVisible(false);
                    } 
                }}
                onOk={async () => {
                    const userDay = selectedDay._d;
                    const customizedDay = `${userDay.getFullYear()}-0${userDay.getMonth()+1}-${userDay.getDate()}`

                    function formatDate(date) {

                        var dd = date.getDate();
                        if (dd < 10) dd = '0' + dd;
                      
                        var mm = date.getMonth() + 1;
                        if (mm < 10) mm = '0' + mm;
                      
                        var yy = date.getFullYear() % 100;
                        if (yy < 10) yy = '0' + yy;
                      
                        return '20' + yy + '-' + mm + '-' + dd;
                      }

                    // сохраняем их в набор данных
                    const values = {
                        operator_id: selectedUser,
                        worked_at: formatDate(new Date(customizedDay))
                    }
                    
                    await props.addHandler(values as ScheduleListItem);
                    props.reload()
                }}
            >
            {/* <ProFormDatePicker
                rules={[
                    {
                        required: true,
                        message: (
                            <FormattedMessage
                                id="pages.user.ruleName"
                                defaultMessage="Rule name is required"
                            />
                        ),
                    },
                ]}
                // width="md"
                name="worked_at"
                className='datepick'
                // style={{ width: '100%!important' }}
            />  */}
           <Form.Item name="worked_at">
                <DatePicker 
                    placeholder='Выберите значение' 
                    style={{ width: '100%' }}
                />
            </Form.Item>
            <ProFormSelect
                // width="md"
                name="operator_id"
                request={async _ => {
                    var s: any = await queryOperators()
                    // console.log(s)
                    if (s.success) {
                        return s.data.map((x: any) => {
                            return {
                                value: x.id,
                                label: x.name
                            }
                        })
                    }
                    return []
                }}
            />
        </Modal>
    </Form>
    )
}

export default NewScheduleForm;