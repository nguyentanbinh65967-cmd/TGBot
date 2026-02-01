"use client";

import { useTelegram } from "@/hooks/useTelegram";

export default function Home() {
  const { user, isReady, isTelegram, webApp } = useTelegram();

  return (
    <main className="min-h-screen bg-white">
      {/* 1. Шапка */}
      <header className="w-full px-4 py-4 md:px-8 md:py-6 flex justify-between items-center border-b border-gray-200">
        <div className="text-xl md:text-2xl font-bold text-gray-900">
          Школа Тхэквондо
        </div>
        {isReady && (
          <div className="flex items-center gap-4">
            {user ? (
              <div className="text-sm md:text-base text-gray-700">
                <span className="font-medium">{user.first_name}</span>
                {user.username && (
                  <span className="text-gray-500 ml-2">@{user.username}</span>
                )}
              </div>
            ) : (
              <button
                onClick={() => {
                  if (isTelegram && webApp) {
                    // Если открыто в Telegram, но пользователь не авторизован
                    // Показываем сообщение
                    webApp.showAlert("Авторизация происходит автоматически через Telegram. Если вы не видите свои данные, пожалуйста, перезагрузите страницу.");
                  } else {
                    // Если открыто не в Telegram
                    alert("Пожалуйста, откройте это приложение через Telegram бота для авторизации.");
                  }
                }}
                className="px-4 py-2 md:px-6 md:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base cursor-pointer"
              >
                Войти
              </button>
            )}
          </div>
        )}
      </header>

      {/* Информация о пользователе Telegram (для отладки) */}
      {isReady && user && (
        <div className="w-full px-4 py-2 bg-blue-50 border-b border-blue-200">
          <div className="max-w-7xl mx-auto text-sm text-blue-800">
            <span className="font-medium">Telegram ID:</span> {user.id}
            {user.username && (
              <>
                {" • "}
                <span className="font-medium">Username:</span> @{user.username}
              </>
            )}
          </div>
        </div>
      )}

      {/* 2. Основной экран */}
      <section className="w-full px-4 py-8 md:px-8 md:py-16 lg:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">
            {/* Изображение слева */}
            <div className="w-full lg:w-1/2">
              <div className="w-full aspect-[4/3] bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-600">
                  <svg
                    className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-4 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <p className="text-sm md:text-base">Изображение спортсменов</p>
                </div>
              </div>
            </div>

            {/* Схема справа */}
            <div className="w-full lg:w-1/2">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 md:mb-8">
                Как начать обучение
              </h2>
              <div className="space-y-4 md:space-y-6">
                {/* Шаг 1 */}
                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg md:text-xl">
                    1
                  </div>
                  <div className="flex-1 pt-1">
                    <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-1">
                      Записаться на пробное занятие
                    </h3>
                    <p className="text-gray-600 text-sm md:text-base">
                      Свяжитесь с нами и запишитесь на бесплатное пробное занятие
                    </p>
                  </div>
                </div>

                {/* Шаг 2 */}
                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg md:text-xl">
                    2
                  </div>
                  <div className="flex-1 pt-1">
                    <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-1">
                      Пройти консультацию
                    </h3>
                    <p className="text-gray-600 text-sm md:text-base">
                      Наш тренер определит ваш уровень и подберет подходящую программу
                    </p>
                  </div>
                </div>

                {/* Шаг 3 */}
                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg md:text-xl">
                    3
                  </div>
                  <div className="flex-1 pt-1">
                    <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-1">
                      Выбрать расписание
                    </h3>
                    <p className="text-gray-600 text-sm md:text-base">
                      Выберите удобное время для занятий из доступных групп
                    </p>
                  </div>
                </div>

                {/* Шаг 4 */}
                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg md:text-xl">
                    4
                  </div>
                  <div className="flex-1 pt-1">
                    <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-1">
                      Начать тренировки
                    </h3>
                    <p className="text-gray-600 text-sm md:text-base">
                      Приступайте к регулярным занятиям и достигайте новых высот
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Преимущества школы */}
      <section className="w-full px-4 py-8 md:px-8 md:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 text-center mb-8 md:mb-12">
            Преимущества нашей школы
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* Карточка 1 */}
            <div className="bg-white rounded-lg p-6 md:p-8 shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 md:w-8 md:h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
              </div>
              <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2 md:mb-3">
                Опытные тренеры
              </h3>
              <p className="text-gray-600 text-sm md:text-base">
                Наши инструкторы имеют многолетний опыт и международные сертификаты
              </p>
            </div>

            {/* Карточка 2 */}
            <div className="bg-white rounded-lg p-6 md:p-8 shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 md:w-8 md:h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2 md:mb-3">
                Современная программа
              </h3>
              <p className="text-gray-600 text-sm md:text-base">
                Индивидуальный подход к каждому ученику с учетом возраста и уровня подготовки
              </p>
            </div>

            {/* Карточка 3 */}
            <div className="bg-white rounded-lg p-6 md:p-8 shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 md:w-8 md:h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2 md:mb-3">
                Удобное расположение
              </h3>
              <p className="text-gray-600 text-sm md:text-base">
                Современный зал в центре города с удобной парковкой и доступом на транспорте
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Контакты */}
      <section className="w-full px-4 py-8 md:px-8 md:py-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 text-center mb-8 md:mb-12">
            Контакты
          </h2>
          <div className="max-w-2xl mx-auto">
            <div className="bg-gray-50 rounded-lg p-6 md:p-8 space-y-6">
              {/* Адрес */}
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 md:w-6 md:h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-1">
                    Адрес
                  </h3>
                  <p className="text-gray-600 text-sm md:text-base">
                    г. Уфа, ул. Маршала Жукова, д. 10
                  </p>
                </div>
              </div>

              {/* Телефон */}
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 md:w-6 md:h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-1">
                    Телефон
                  </h3>
                  <p className="text-gray-600 text-sm md:text-base">
                    +7 (917) 457-96-17
                  </p>
                </div>
              </div>

              {/* Telegram */}
              <div className="pt-4">
                <a
                  href="#"
                  className="w-full flex items-center justify-center gap-3 px-6 py-3 md:py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm md:text-base"
                >
                  <svg
                    className="w-5 h-5 md:w-6 md:h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.169 1.858-.896 6.375-1.262 8.453-.164.936-.487 1.249-.8 1.281-.696.064-1.225-.461-1.901-.903-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.14.118.095.151.223.167.312.017.09.037.297.021.461z" />
                  </svg>
                  Написать в Telegram
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
