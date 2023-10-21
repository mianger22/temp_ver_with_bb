import React, { ReactNode, useEffect, useState } from 'react';
import { ProFormSelect, ProFormText, ProFormDateTimePicker, StepsForm, ProFormDigit } from '@ant-design/pro-form';
import { CureListItem } from '../data';
import { queryUsers } from '../../User/list/service';
import { FormattedMessage, dynamic } from 'umi';
import { Modal } from 'antd';
import { FormChangeInfo } from 'rc-field-form/lib/FormContext';
import request from '@/utils/request';
import ToothMap from '@/components/ToothMap/ToothMap';
import { AvailableListData } from '@/pages/directory/available/data';
import arraySort from 'array-sort';

export type NewScheduleFormProps = {
    visible: boolean,
    onChangeVisible: (visible: boolean) => void,
    addHandler: (value: CureListItem) => Promise<boolean>,
    reload: () => void,
    title: string,
    availables: AvailableListData[],
    healths: any[],
    nerves: any[]
}

const NewCureForm: React.FC<NewScheduleFormProps> = (props) => {
    const [userId, setUserId] = useState("")
    const [selectedUser, setSelectedUser] = useState(false)
    const [current, setCurrent] = useState(0)
    const [userToothMap, setUserToothMap] = useState([])
    const [selectedTeeth, setSelectedTeeth] = useState<number[]>([])
    const [selectedTeethField, setSelectedTeethFields] = useState<ReactNode[]>([])

    // useEffect(() => {
    //     // срабатывает при выборе пациента
    //     (async () => {
    //         if (userId && userId.length > 4) {
    //             const response = await request(`/api/v1/dentistry/map/${userId}`);

    //             if (userToothMap.length === 0) {
    //                 setUserToothMap(response.result.tooths);
    //             }
    //         }
    //     })()
    // }, [userId, userToothMap])
    
    useEffect(() => {
        var v = selectedTeeth.map(x => {
            return <ProFormText
                name={`plan_cure_tooth_${x}`}
                key={`plan_cure_tooth_${x}`}
                label={`Описание по зубу ${x}`}
            />
        })
        setSelectedTeethFields(v)
    }, [selectedTeeth])
    useEffect(() => {
        return () => {
            // console.log("cleaned up");
        };
    }, []);
    // const actionRef = useRef<ActionType>();
    return (<StepsForm
        current={current}
        onCurrentChange={setCurrent}
        onFormChange={async (name, info: FormChangeInfo) => {
            info.changedFields.forEach(f => {
                if ((f.name as string[]).indexOf("user_id") > -1) {
                    if (f.value) {
                        setSelectedUser(true)
                        setUserId(f.value)
                    }
                }
            })
        }}
        onFinish={async (values: any) => {
            //console.log("val:", values);

            var props_ = Object.getOwnPropertyNames(values)
            var plan = props_.filter(x => /plan_cure_tooth/.test(x)).map(x => {
                return {
                    "position": x.split("_").filter(x => !isNaN(parseInt(x))).map(x => parseInt(x))[0],
                    "description": values[x]
                }
            })
            // console.log(values.stamp)

        //    for (let i = 0; i < userToothMap.length; i++) {
        //         let el: any = userToothMap[i];
              
        //         if (el.health_ids.length > 0) {
        //             console.log("el =", el)
        //             plan.push(el.health_ids)
        //         }
        //    }

            let result: CureListItem = {
                user_id: values.user_id,
                stamp: new Date(values.stamp),
                // stamp: new Date(values.stamp).toUTCString(),
                // stamp: new Date(values.stamp).toISOString(),
                name: values.name,
                plan_cure: plan,
                result_cure: [],
                cost: parseFloat(values.cost),
                cost_with_discount: parseFloat(values.cost_with_discount),
                doctor: values.doctor,
                diagnose: values.diagnose,
                step: values.step,
                tooths: []
            }

            // меняю формат даты
            const day = result.stamp.toLocaleString('default', { day: 'numeric' });
            const month = result.stamp.toLocaleString('default', { month: 'numeric' });
            const year = result.stamp.toLocaleString('default', { year: 'numeric' });
            const hour = result.stamp.toLocaleString('default', { hour: 'numeric' });
            let minute = result.stamp.toLocaleString('default', { minute: 'numeric' });
            let second = result.stamp.toLocaleString('default', { second: 'numeric' });

            if (minute < 10) minute = "0" + minute;
            if (second < 10) second = "0" + second;

            const adjusted_date = year + "-" + month + "-" + day + "T" + hour + ":" + minute + ":" + second + ".259Z";

            // меняю формат даты на нужный
            result.stamp = adjusted_date;

            // console.clear();
            // console.log("result !! =", result);

            const resultДобавление = await props.addHandler(result);

            if (resultДобавление) {
                setCurrent(0)
                props.onChangeVisible(false)
                props.reload()
            }
        }}
        stepsProps={{
            size: 'small',
        }}
        stepsFormRender={(dom, submitter) => {
            return (<Modal
                width={640}
                bodyStyle={{ padding: '32px 40px 48px' }}
                destroyOnClose
                title="Новая запись"
                visible={props.visible}
                footer={submitter}
                onCancel={(e) => {
                    if (e.currentTarget.className === "ant-modal-close") {
                        // когда кликнули только по крестику
                        setCurrent(0)
                        props.onChangeVisible(false);
                    } 
                }}
            >
                {dom}
            </Modal>)
        }}>
        <StepsForm.StepForm title="Общая информация">
            <ProFormText
                label="Название процедуры"
                width="md"
                name="name"
                rules={[{ required: true }]}
            />
            <ProFormDateTimePicker
                label="Дата приема"

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
                width="md"
                name="stamp"
            />
            <ProFormSelect
                showSearch
                label="Врач"
                width="md"
                name="doctor"
                rules={[{ required: true }]}
                debounceTime={300}
                
                request={async _ => {
                    let newDoctorsData: any;
                    // let s: any;

                    const doctorsDataResponse = await request('/api/v1/doctors/');
                    const doctorsList = doctorsDataResponse.result.items;

                    // создаём массив для хранения имён пользователей
                    let listDoctorsNames: any = [];

                    function core(): any {
                        if (newDoctorsData) {
                            let ndd = JSON.parse(newDoctorsData);
                            let listUserNamesTemp: any = [];

                            for (let i = 0; i < ndd.length; i++) {
                                listUserNamesTemp.push({ id: ndd[i].id, name: ndd[i].name || "", surname: ndd[i].surname || "" })
                            } 

                            // сортируем по фамилиям в алфавитном порядке
                            listDoctorsNames = arraySort(listUserNamesTemp, 'surname');
                        } else {
                            let listUserNamesTemp: any = [];

                            for (let i = 0; i < doctorsList.length; i++) {
                                listUserNamesTemp.push({ id: doctorsList[i].id, name: doctorsList[i].name || "", surname: doctorsList[i].surname || "" })
                            }

                            // сортируем по фамилиям в алфавитном порядке
                            listDoctorsNames = arraySort(listUserNamesTemp, 'surname');
                        }
                    
                        return true;
                    }

                    if (!localStorage.getItem('doctorsData')) {
                        // s = await queryUsers();

                        // if (s.success) {
                            localStorage.setItem('doctorsData', JSON.stringify(doctorsList));

                            core();
                        
                            return listDoctorsNames.map((user: any) => {
                                // поменял в возвращаемом значении value id на имя пользователя
                                const userName = `${user.surname || 'N'} ${user.name || 'A'}` || 'Не указан';

                                return {
                                    value: userName,
                                    label: userName
                                }
                            })
                        // }
                    } else {
                        newDoctorsData = localStorage.getItem('doctorsData');

                        core();

                        return listDoctorsNames.map((user: any) => {
                            // поменял в возвращаемом значении value id на имя пользователя
                            const userName = `${user.surname || 'N'} ${user.name || 'A'}` || 'Не указан';

                            return {
                                value: userName,
                                label: userName
                            }
                        })
                    }

                    return []
                }}
            /> 
            <ProFormSelect
                showSearch
                label="Пациент"
                width="md"
                name="user_id"
                rules={[{ required: true }]}
                debounceTime={300}
                request={async _ => {
                    let newUsersData: any;
                    let s: any;

                    // создаём массив для хранения имён пользователей
                    let listUserNames: any = [];

                    function core(): any {
                        if (newUsersData) {
                            let nud = JSON.parse(newUsersData);
                            let listUserNamesTemp: any = [];

                            for (let i = 0; i < nud.length; i++) {
                                listUserNamesTemp.push({ id: nud[i].id, name: nud[i].name || "", surname: nud[i].surname || "" })
                            }

                            // сортируем по фамилиям в алфавитном порядке
                            listUserNames = arraySort(listUserNamesTemp, 'surname');
                        } else {
                            let listUserNamesTemp: any = [];

                            for (let i = 0; i < s.data.length; i++) {
                                listUserNamesTemp.push({ id: s.data[i].id, name: s.data[i].name || "", surname: s.data[i].surname || "" })
                            }

                            // сортируем по фамилиям в алфавитном порядке
                            listUserNames = arraySort(listUserNamesTemp, 'surname');
                        }
                    
                        return true;
                    }

                    if (!localStorage.getItem('usersData')) {
                        s = await queryUsers();

                        if (s.success) {
                            localStorage.setItem('usersData', JSON.stringify(s.data));

                            core();
                        
                            return listUserNames.map((user: any) => {
                                return {
                                    value: user.id,
                                    label: `${user.surname || 'N'} ${user.name || 'A'}` || 'Не указан'
                                }
                            })
                        }
                    } else {
                        newUsersData = localStorage.getItem('usersData');

                        core();

                        return listUserNames.map((user: any) => {
                            return {
                                value: user.id,
                                label: `${user.surname || 'N'} ${user.name || 'A'}` || 'Не указан'
                            }
                        })
                    }

                    return []
                }}
            />
        </StepsForm.StepForm>
        {/* // проверить сохраняются ли данные со 2 этааа в повиторном создании прима
        //  */}
        <StepsForm.StepForm title="План лечения">
            {/* {JSON.stringify(userToothMap)} */}
            <ToothMap
                availables={props.availables}
                healths={props.healths}
                nerves={props.nerves}
                data={userToothMap}
                canEdit={false}
                selected={selectedTeeth}
                selectFn={(position: number, state: boolean): boolean => {
                    if (selectedTeeth.indexOf(position) > -1 && !state) {
                        // // console.log(`remove ${position}`)
                        setSelectedTeeth(selectedTeeth.filter(x => x != position))
                        return true
                    }
                    if (selectedTeeth.indexOf(position) == -1 && state) {
                        // // console.log(`add ${position}`)
                        var v = [...selectedTeeth];
                        v.push(position)
                        setSelectedTeeth(v)
                        return true
                    }
                    return false
                }}
                showTemporaryDescriptions={true}
                usId={userId}
                selectedUser={selectedUser}
                setSelectedUser={setSelectedUser}
            />
            {selectedTeethField}
        </StepsForm.StepForm>
        <StepsForm.StepForm title="Диагноз">
            <ProFormText
                label={"Диагноз"}
                name="diagnose"
            />
            <ProFormText
                label={"Этап"}
                name="step"
            />
        </StepsForm.StepForm>
        <StepsForm.StepForm title="Стоимость">
            <ProFormDigit
                label={"Стоимость"}
                name="cost"
            />
            <ProFormDigit
                label={"Стоимость со скидкой"}
                name="cost_with_discount"
            />
        </StepsForm.StepForm>
    </StepsForm>)
}

export default NewCureForm;