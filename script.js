// 급식 정보 조회 함수
async function searchMeal() {
    const dateInput = document.getElementById('dateInput');
    const resultSection = document.getElementById('resultSection');
    const loading = document.getElementById('loading');
    const mealInfo = document.getElementById('mealInfo');
    const errorMessage = document.getElementById('errorMessage');
    const mealDate = document.getElementById('mealDate');
    const mealContent = document.getElementById('mealContent');

    // 날짜 입력 확인
    if (!dateInput.value) {
        Swal.fire({
            icon: 'warning',
            title: '날짜를 선택해주세요',
            text: '조회하고 싶은 날짜를 선택한 후 다시 시도해주세요.',
            confirmButtonText: '확인',
            confirmButtonColor: '#3b82f6',
            showClass: {
                popup: 'animate__animated animate__fadeInDown'
            },
            hideClass: {
                popup: 'animate__animated animate__fadeOutUp'
            }
        });
        return;
    }

    // 결과 섹션 표시 및 로딩 시작
    resultSection.style.display = 'block';
    loading.style.display = 'block';
    mealInfo.style.display = 'none';
    errorMessage.style.display = 'none';

    // 로딩 토스트 표시
    const loadingToast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
    });

    loadingToast.fire({
        icon: 'info',
        title: '급식 정보를 불러오는 중...'
    });

    try {
        // 날짜 형식 변환 (YYYY-MM-DD -> YYYYMMDD)
        const selectedDate = dateInput.value.replace(/-/g, '');
        
        // API URL 구성
        const apiUrl = `https://open.neis.go.kr/hub/mealServiceDietInfo?ATPT_OFCDC_SC_CODE=B10&SD_SCHUL_CODE=7010255&MLSV_YMD=${selectedDate}`;
        
        // CORS 우회를 위한 프록시 서버 사용
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(apiUrl)}`;
        
        const response = await fetch(proxyUrl);
        const data = await response.json();
        
        // 로딩 종료
        loading.style.display = 'none';
        
        // 데이터 파싱
        if (data.contents) {
            const xmlData = data.contents;
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlData, 'text/xml');
            
            // 급식 정보 추출
            const mealElements = xmlDoc.getElementsByTagName('row');
            
            if (mealElements.length > 0) {
                // 급식 정보가 있는 경우
                const mealData = mealElements[0];
                const mealType = mealData.getElementsByTagName('MMEAL_SC_NM')[0]?.textContent || '급식';
                const mealContentText = mealData.getElementsByTagName('DDISH_NM')[0]?.textContent || '';
                
                // 날짜 표시
                const displayDate = formatDate(dateInput.value);
                mealDate.textContent = `${displayDate} ${mealType}`;
                
                // 급식 내용 표시
                if (mealContentText) {
                    const menuItems = mealContentText.split('<br/>').filter(item => item.trim());
                    const menuList = menuItems.map(item => {
                        const cleanItem = item.trim();
                        return `
                            <div class="meal-item animate-fade-in-up">
                                <div class="flex items-center">
                                    <i class="bi bi-check-circle-fill text-green-500 me-3 text-lg"></i>
                                    <span class="text-gray-800 font-medium">${cleanItem}</span>
                                </div>
                            </div>
                        `;
                    }).join('');
                    
                    document.getElementById('mealContent').innerHTML = `
                        <div class="space-y-3">
                            <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                <i class="bi bi-list-ul me-2 text-blue-500"></i>
                                오늘의 메뉴
                            </h3>
                            ${menuList}
                        </div>
                    `;
                } else {
                    document.getElementById('mealContent').innerHTML = `
                        <div class="text-center py-8">
                            <i class="bi bi-exclamation-circle text-gray-400 text-4xl mb-4"></i>
                            <p class="text-gray-500">급식 정보가 없습니다.</p>
                        </div>
                    `;
                }
                
                mealInfo.style.display = 'block';
                
                // 성공 토스트
                Swal.fire({
                    icon: 'success',
                    title: '급식 정보 조회 완료!',
                    text: `${displayDate}의 급식 정보를 성공적으로 불러왔습니다.`,
                    timer: 2000,
                    showConfirmButton: false,
                    position: 'top-end',
                    toast: true
                });
                
            } else {
                // 급식 정보가 없는 경우
                errorMessage.style.display = 'block';
                
                Swal.fire({
                    icon: 'info',
                    title: '급식 정보 없음',
                    text: '선택한 날짜에는 급식 정보가 등록되어 있지 않습니다.',
                    confirmButtonText: '확인',
                    confirmButtonColor: '#3b82f6'
                });
            }
        } else {
            // API 응답 오류
            errorMessage.style.display = 'block';
            
            Swal.fire({
                icon: 'error',
                title: '데이터 로드 실패',
                text: '급식 정보를 불러오는 중 오류가 발생했습니다.',
                confirmButtonText: '다시 시도',
                confirmButtonColor: '#ef4444',
                showCancelButton: true,
                cancelButtonText: '취소',
                cancelButtonColor: '#6b7280'
            });
        }
        
    } catch (error) {
        console.error('급식 정보 조회 중 오류 발생:', error);
        loading.style.display = 'none';
        errorMessage.style.display = 'block';
        errorMessage.innerHTML = `
            <div class="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <i class="bi bi-exclamation-triangle text-red-600 text-2xl"></i>
            </div>
            <h3 class="text-xl font-semibold text-red-800 mb-2">오류 발생</h3>
            <p class="text-red-600">급식 정보를 불러오는 중 오류가 발생했습니다.</p>
        `;
        
        Swal.fire({
            icon: 'error',
            title: '연결 오류',
            text: '서버에 연결할 수 없습니다. 인터넷 연결을 확인하고 다시 시도해주세요.',
            confirmButtonText: '확인',
            confirmButtonColor: '#ef4444'
        });
    }
}

// 날짜 형식 변환 함수 (YYYY-MM-DD -> YYYY년 MM월 DD일)
function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    return `${year}년 ${month}월 ${day}일`;
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 오늘 날짜로 설정
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('dateInput').value = today;
    
    // Enter 키 이벤트 처리
    document.getElementById('dateInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchMeal();
        }
    });
    
    // 페이지 로드 완료 알림
    Swal.fire({
        icon: 'success',
        title: '환영합니다!',
        text: '급식 정보 조회 서비스에 오신 것을 환영합니다.',
        timer: 2000,
        showConfirmButton: false,
        position: 'top-end',
        toast: true
    });
    
    // 애니메이션 효과 추가
    const elements = document.querySelectorAll('.animate-fade-in-up');
    elements.forEach((element, index) => {
        element.style.animationDelay = `${index * 0.1}s`;
    });
});

// 급식 정보 예시 데이터 (개발용)
const sampleMealData = {
    '20250714': {
        type: '중식',
        menu: [
            '백미밥',
            '미역국',
            '돈까스',
            '양배추샐러드',
            '깍두기',
            '요구르트'
        ]
    }
};

// 샘플 데이터로 테스트하는 함수 (개발용)
function testWithSampleData() {
    const dateInput = document.getElementById('dateInput');
    const resultSection = document.getElementById('resultSection');
    const mealInfo = document.getElementById('mealInfo');
    const errorMessage = document.getElementById('errorMessage');
    const mealDate = document.getElementById('mealDate');
    const mealContent = document.getElementById('mealContent');

    const selectedDate = dateInput.value.replace(/-/g, '');
    const sampleData = sampleMealData[selectedDate];

    resultSection.style.display = 'block';
    mealInfo.style.display = 'none';
    errorMessage.style.display = 'none';

    if (sampleData) {
        const displayDate = formatDate(dateInput.value);
        mealDate.textContent = `${displayDate} ${sampleData.type}`;
        
        const menuList = sampleData.menu.map(item => `
            <div class="meal-item animate-fade-in-up">
                <div class="flex items-center">
                    <i class="bi bi-check-circle-fill text-green-500 me-3 text-lg"></i>
                    <span class="text-gray-800 font-medium">${item}</span>
                </div>
            </div>
        `).join('');
        
        document.getElementById('mealContent').innerHTML = `
            <div class="space-y-3">
                <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <i class="bi bi-list-ul me-2 text-blue-500"></i>
                    오늘의 메뉴
                </h3>
                ${menuList}
            </div>
        `;
        
        mealInfo.style.display = 'block';
        
        Swal.fire({
            icon: 'success',
            title: '샘플 데이터 로드 완료!',
            text: '개발용 샘플 데이터가 성공적으로 로드되었습니다.',
            timer: 2000,
            showConfirmButton: false,
            position: 'top-end',
            toast: true
        });
    } else {
        errorMessage.style.display = 'block';
        
        Swal.fire({
            icon: 'info',
            title: '샘플 데이터 없음',
            text: '해당 날짜의 샘플 데이터가 없습니다.',
            confirmButtonText: '확인',
            confirmButtonColor: '#3b82f6'
        });
    }
}

// 키보드 단축키 지원
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + Enter로 급식 정보 조회
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        searchMeal();
    }
    
    // ESC 키로 결과 숨기기
    if (e.key === 'Escape') {
        const resultSection = document.getElementById('resultSection');
        if (resultSection.style.display === 'block') {
            resultSection.style.display = 'none';
        }
    }
});
