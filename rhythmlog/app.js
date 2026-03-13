document.addEventListener("DOMContentLoaded", () => {
  // Page Transition: Enter
  document.body.classList.add("loaded");

  const exitPage = (target) => {
    document.body.classList.remove("loaded");
    document.body.classList.add("exiting");
    setTimeout(() => {
      window.location.href = target;
    }, 400);
  };

  // Dynamic Greeting Logic
  const greetingEl = document.getElementById('dynamic-greeting');
  if (greetingEl) {
    const hour = new Date().getHours();
    let greetingText = '';
    if (hour < 11) {
      greetingText = '몸이 조금 무거울 수 있는 아침이네요.<br>오늘의 기분은 어떤가요?';
    } else if (hour < 17) {
      greetingText = '나른해지기 쉬운 오후네요.<br>오늘의 컨디션은 어떤가요?';
    } else {
      greetingText = '수고한 나를 다독이는 저녁이네요.<br>오늘 하루 어땠나요?';
    }
    greetingEl.innerHTML = greetingText;
  }

  // Progressive Disclosure Checkin Logic
  const stepContainers = document.querySelectorAll('.step-container');
  if (stepContainers.length > 0) {
    const radioGroups = document.querySelectorAll('.radio-group');
    const submitContainer = document.getElementById('step-submit');

    radioGroups.forEach(group => {
      const stepNum = parseInt(group.getAttribute('data-step'));
      const btns = group.querySelectorAll('.radio-btn');
      
      btns.forEach(btn => {
        btn.addEventListener('click', () => {
          // Visual selection
          btns.forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');

          // Reveal next step
          const nextStepNum = stepNum + 1;
          const nextStepEl = document.getElementById('step-' + nextStepNum);
          
          if (nextStepEl && nextStepEl.classList.contains('hidden-step')) {
            nextStepEl.classList.remove('hidden-step');
            nextStepEl.classList.add('fade-in-up');
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
          } else if (!nextStepEl && submitContainer && submitContainer.classList.contains('hidden-step')) {
            submitContainer.classList.remove('hidden-step');
            submitContainer.classList.add('fade-in-up');
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
          }
        });
      });
    });
  }

  // Checkin Submit Logic
  const checkinBtn = document.getElementById('submit-checkin-btn');
  if (checkinBtn) {
    checkinBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = checkinBtn.getAttribute('data-href');
      checkinBtn.innerText = "AI가 오늘의 리듬을 짜고 있어요...";
      checkinBtn.style.opacity = '0.7';
      checkinBtn.style.pointerEvents = 'none';

      const loading = document.getElementById('loading-overlay');
      if (loading) loading.classList.add('active');
      
      // Simulate AI analysis delay
      setTimeout(() => {
        exitPage(target);
      }, 1500);
    });
  }

  // Routine NOW Action Confetti
  const doNowBtn = document.querySelector('.do-now-btn');
  if (doNowBtn) {
    doNowBtn.addEventListener('click', () => {
      if (typeof confetti === 'function') {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
      doNowBtn.innerText = "완료!";
      doNowBtn.classList.remove('button-primary');
      doNowBtn.classList.add('button-secondary');
      doNowBtn.style.pointerEvents = 'none';
    });
  }

  // Reflection Textarea Logic
  const reflectionBg = document.getElementById('reflection-bg');
  const reflectionCards = document.querySelectorAll('.input-card.reflection-card');
  const countedInputs = document.querySelectorAll('.counted-input');

  reflectionCards.forEach(card => {
    const input = card.querySelector('.counted-input');
    const counter = card.querySelector('.char-counter');

    if (input) {
      // Focus blur effect
      input.addEventListener('focus', () => {
        if (reflectionBg) reflectionBg.classList.add('active');
        reflectionCards.forEach(c => c.style.opacity = '0.3');
        card.style.opacity = '1';
        card.classList.add('focused');
      });

      input.addEventListener('blur', () => {
        if (reflectionBg) reflectionBg.classList.remove('active');
        reflectionCards.forEach(c => c.style.opacity = '1');
        card.classList.remove('focused');
      });

      // Character counter
      input.addEventListener('input', () => {
        const len = input.value.length;
        counter.innerText = `${len}/50`;
        
        if (len >= 50) {
          counter.classList.add('limit');
          // Add re-trigger hack for animation
          counter.style.animation = 'none';
          counter.offsetHeight; /* trigger reflow */
          counter.style.animation = null; 
        } else {
          counter.classList.remove('limit');
        }
      });
    }
  });

  // Reflection Save & Toast
  const doSaveBtn = document.querySelector('.do-save-btn');
  if (doSaveBtn) {
    doSaveBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = doSaveBtn.getAttribute('data-href');
      const toast = document.getElementById('toast-notification');
      
      // Dust animation for hard feeling
      const dustInput = document.querySelector('[data-dust="true"]');
      if (dustInput && dustInput.value.trim() !== '') {
        dustInput.classList.add('vent-dust');
      }

      // Show toast
      if (toast) {
        toast.innerText = "수고했어요. 오늘 하루도 무사히 닫았습니다 🌙";
        toast.classList.add('show');
        
        setTimeout(() => {
          toast.classList.remove('show');
          setTimeout(() => {
            exitPage(target);
          }, 300);
        }, 2000);
      } else {
        exitPage(target);
      }
    });
  }

  // Routine Start Action
  const doStartBtn = document.querySelector('.do-start-btn');
  if (doStartBtn) {
    doStartBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = doStartBtn.getAttribute('data-href');
      const cards = document.querySelectorAll('.routine-card');
      
      if (cards.length > 0) {
        cards.forEach(card => card.classList.add('cards-locked'));
        setTimeout(() => {
          exitPage(target);
        }, 500);
      } else {
        exitPage(target);
      }
    });
  }

  // Scroll Animations (Intersection Observer)
  const scrollElements = document.querySelectorAll('[data-scroll]');
  if (scrollElements.length > 0) {
    const scrollObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, {
      root: null,
      rootMargin: '0px',
      threshold: 0.2
    });

    scrollElements.forEach(el => scrollObserver.observe(el));
  }

  // Generic Link Transition
  const transitionLinks = document.querySelectorAll('a, [data-href]:not(.do-checkin-btn):not(.do-save-btn):not(.do-start-btn)');
  transitionLinks.forEach(el => {
    el.addEventListener('click', (e) => {
      let target = el.getAttribute('href') || el.getAttribute('data-href');
      if (target && !target.startsWith('#') && target !== '') {
        e.preventDefault();
        exitPage(target);
      }
    });
  });

});
