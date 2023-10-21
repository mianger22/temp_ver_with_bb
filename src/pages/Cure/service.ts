import request from '@/utils/request';
// import { isArray } from 'lodash';
import type { CureListParams, CureListItem } from './data.d';

async function setToothPlan(cure: any) {
  const tooth_map = await request(`/api/v1/dentistry/map/${cure.id}`);

  if (tooth_map.error === false) {      
    cure.tooths = tooth_map.result.tooths;
  } 
}

export async function queryCure(params?: CureListParams) {
  // получаю 
  // - имя пациента из поиска
  const pacient_name_from_search = params?.user_name && params.user_name.toLowerCase();
  // - имя доктора из поиска
  const doctor_name_from_search = params?.doctor && params.doctor.toLowerCase();
  // - диапазон дат из поиска
  const date_range_from_search = params?.stamp && params.stamp;
  // - список всех приёмов
  const request_for_cures: any = await request('/api/v1/dentistry/cure/?sorter={"stamp": "descend"}&pageSize=20&current=' + params?.current);
  const cures_from_database: any = request_for_cures.result.items;
  // - список всех пользователей
  const request_for_users: any = await request('/api/v1/users');
  const users_from_database: any = request_for_users.result;

  let list_all_cures: any = await request('/api/v1/dentistry/cure/?pageSize=349');
  list_all_cures = list_all_cures.result.items;

  // показывает, был ли применён фильтр
  let filterData: boolean = false;

  // создаю общую функцию определения соответствия введённому в поиск диапазону даты даты конкретного приёма
  const filterByDate = (date: Date, stamp: Object) => {
    // получаем даты До, После
    let start = stamp[0], end = stamp[1];

    // приводим к понятному виду
    start = start ? new Date(start) : null;
    end = end ? new Date(end) : null;
    date = new Date(date);

    // возвращаем ответ - входит ли дата юзера в присланный диапазон stamp
    return !((start && start > date) || (end && end < date));
  }

  if (request_for_cures.error === false) {
    // формирую массив для показа админу подготовленную информацию обо всех приёмах
    let modified_cures: object[] = [];

    // формирую нужную информацию, перебирая все приёмы и добавляя к ним недостающие данные пользователя
    list_all_cures.map((sch: CureListItem) => {
      // нахожу по id пользователя, взятого из приёма, нужного пользователя среди других
      const user_data = users_from_database.find((x: any) => x.id == sch.user_id);

      if (user_data) {       
        // добавляю ту самую информацию к информации приёма для заполнения нужных столбцов
        sch['user'] = user_data;
        sch['user_name'] = `${user_data['surname']} ${user_data['name']}`;
        sch['user_phone'] = user_data['phone'];

        if (date_range_from_search) {
          // получаем - подходит ли дата пользователя диапазону из поиска
          const suitableDate = filterByDate(sch['stamp'].$date, params.stamp);

          if (suitableDate === true) {
            sch['suitableDate'] = true;
          } else {
            sch['suitableDate'] = false;
          }
        }

        return sch;
      } else {
        return null;
      }
    }).filter((x: any) => x != null)

    const intermediate_modified_cures = cures_from_database.map((sch: CureListItem) => {
      // нахожу по id пользователя, взятого из приёма, нужного пользователя среди других
      const user_data = users_from_database.find((x: any) => x.id == sch.user_id);

      if (user_data) {       
        // добавляю ту самую информацию к информации приёма для заполнения нужных столбцов
        sch['user'] = user_data;
        sch['user_name'] = `${user_data['surname']} ${user_data['name']}`;
        sch['user_phone'] = user_data['phone'];

        if (date_range_from_search) {
          // получаем - подходит ли дата пользователя диапазону из поиска
          const suitableDate = filterByDate(sch['stamp'].$date, params.stamp);

          if (suitableDate === true) {
            sch['suitableDate'] = true;
          } else {
            sch['suitableDate'] = false;
          }
        }

        return sch;
      } else {
        return null;
      }
    }).filter((x: any) => x != null)
    
    // теперь перебираю каждый приём, где cure - сам приём
    list_all_cures.forEach((cure: CureListItem) => {
      // получаю
      // - имя пациента из БД
      const pacient_name_from_database = cure.user_name && cure.user_name.toLowerCase();
      // - имя доктора, ведущего пациента, из БД
      const doctor_name_from_database = cure.doctor && cure.doctor.toLowerCase();
      // - подходящая ли дата диапазону, указанному администратором
      const suitable_date_range_from_search = cure.suitableDate;

      if (!pacient_name_from_search && !doctor_name_from_search && !date_range_from_search) {
        setToothPlan(cure);
        modified_cures = intermediate_modified_cures;
      } else if (pacient_name_from_search && pacient_name_from_database && pacient_name_from_database.indexOf(pacient_name_from_search) >= 0 === true) {
        setToothPlan(cure);
        modified_cures.push(cure);

        filterData = true;
      } else if (doctor_name_from_search && doctor_name_from_database && doctor_name_from_database.indexOf(doctor_name_from_search) >= 0 === true) {
        setToothPlan(cure);
        modified_cures.push(cure);

        filterData = true;
      } else if (date_range_from_search && suitable_date_range_from_search && suitable_date_range_from_search === true) {
        setToothPlan(cure);
        modified_cures.push(cure);

        filterData = true;
      } 
    });

    // ещё надо пповерить - есть ли конкретная страница, чтобы при переходе на 8 стр не выдавалиась 1 страницп
    return {
      data: modified_cures,
      success: true,
      total: filterData === false ? request_for_cures.result.total : modified_cures.length
    }
  }

  return []
}

export async function removeRule(params: { id: string[] }) {
  for (var id in params.id) {
    return request(`/api/v1/dentistry/cure/${params.id[id]}`, {
      method: 'DELETE'
    });
  }
}

export async function addRule(params: CureListItem) {
  return request('/api/v1/dentistry/cure/', {
    method: 'POST',
    data: {
      ...params
    },
  });
}

export async function updateRule(params: CureListItem) {
  return request(`/api/v1/dentistry/cure/${params.id}`, {
    method: 'PATCH',
    data: {
      ...params
    },
  });
}
