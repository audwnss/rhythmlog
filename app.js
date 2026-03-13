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
    const oneThingInput = document.getElementById('one-thing');
    const goToPart2Btn = document.getElementById('go-to-part-2');
    const checkinBg = document.getElementById('checkin-bg');
    const checkinCard = document.querySelector('.checkin-input-card');

    const view1 = document.getElementById('checkin-view-1');
    const view2 = document.getElementById('checkin-view-2');

    // State for branching
    let energySelection = '';
    let moodSelection = '';

    const revealStep = (el) => {
      if (el && el.classList.contains('hidden-step')) {
        el.classList.remove('hidden-step');
        el.classList.add('fade-in-up');
        setTimeout(() => {
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }, 100);
      }
    };

    radioGroups.forEach(group => {
      const stepNum = parseInt(group.getAttribute('data-step'));
      const btns = group.querySelectorAll('.radio-btn');
      
      btns.forEach(btn => {
        btn.addEventListener('click', () => {
          btns.forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');

          if (stepNum === 1) energySelection = btn.getAttribute('data-value');
          if (stepNum === 3) {
            moodSelection = btn.getAttribute('data-value');
            revealStep(document.getElementById('part-1-next'));
          }

          let nextStepEl;
          if (stepNum === 4) {
            if (energySelection === 'low' || moodSelection === 'exhausted') {
              nextStepEl = document.getElementById('step-5');
            } else {
              nextStepEl = document.getElementById('step-6');
            }
          } else if (stepNum === 5) {
            nextStepEl = document.getElementById('step-6');
          } else {
            nextStepEl = document.getElementById('step-' + (stepNum + 1));
          }

          if (nextStepEl) {
            revealStep(nextStepEl);
          }
        });
      });
    });

    if (goToPart2Btn) {
      goToPart2Btn.addEventListener('click', () => {
        // Transition effect like exitPage but internally
        view1.classList.add('fade-out');
        setTimeout(() => {
          view1.classList.add('hidden-step');
          view2.classList.remove('hidden-step');
          view2.classList.add('fade-in-up');
          window.scrollTo({ top: 0, behavior: 'smooth' });
          revealStep(document.getElementById('step-4'));
        }, 400);
      });
    }

    if (oneThingInput && checkinCard) {
      oneThingInput.addEventListener('focus', () => {
        // Background blur effect removed as per user request
        checkinCard.classList.add('focused');
      });
      oneThingInput.addEventListener('blur', () => {
        checkinCard.classList.remove('focused');
      });
      oneThingInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          // Allow progression even if input is empty
          revealStep(submitContainer);
        }
      });
      oneThingInput.addEventListener('input', () => {
        // Show submit button as soon as user starts typing (already handled by revealStep in radio button logic mostly, but let's be explicit)
        revealStep(submitContainer);
      });
    }

    // Explicitly reveal submit container when step 6 is revealed via branching or sequential flow
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.target.id === 'step-6' && !mutation.target.classList.contains('hidden-step')) {
          revealStep(submitContainer);
        }
      });
    });
    const step6 = document.getElementById('step-6');
    if (step6) {
      observer.observe(step6, { attributes: true, attributeFilter: ['class'] });
    }
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
      
      // Save data for routine logic
      const selectedEnergy = document.querySelector('.radio-group[data-step="1"] .radio-btn.selected');
      if (selectedEnergy) {
        localStorage.setItem('userEnergy', selectedEnergy.getAttribute('data-value') || selectedEnergy.innerText);
      }
      
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

  // --- Routine Page Logic (Refined Dashboard Grid & AI Engine) ---
  const routineMain = document.querySelector('.routine-dashboard');
  if (routineMain) {
    const userEnergy = localStorage.getItem('userEnergy') || '보통';
    const routineTitle = document.getElementById('routine-title');
    const nowTaskTitle = document.getElementById('now-task-title');
    const nowTaskDesc = document.getElementById('now-task-desc');
    const dumpInput = document.getElementById('dump-input');
    const dumpList = document.getElementById('dump-list');
    const dropZones = document.querySelectorAll('.routine-drop-zone');
    const startAiBtn = document.getElementById('start-ai-btn');
    const aiLoading = document.getElementById('ai-loading-overlay');

    // 1. Initialize Header Content based on energy
    const updateHeader = () => {
      if (userEnergy === 'low') {
        routineTitle.innerHTML = '오늘은 에너지가 낮으니<br>무리하지 않는 선에서 시작할게요.';
      } else if (userEnergy === '높음') {
        routineTitle.innerHTML = '에너지가 충만하시네요!<br>오늘의 성장을 위한 최적의 리듬입니다.';
      } else {
        routineTitle.innerHTML = '오늘의 에너지는 보통이네요.<br>성취감을 느낄 수 있는 리듬을 제안합니다.';
      }
    };
    updateHeader();

    // 2. Draggable Item Setup
    const setupDraggable = (el) => {
      el.addEventListener('dragstart', (e) => {
        el.classList.add('dragging');
        e.dataTransfer.setData('text/plain', el.innerText);
        // If it's a card being dragged back, we might want to store more data
        if (el.classList.contains('routine-card')) {
          el.dataset.draggedType = 'card';
          // Find parent zone to update count if focus
          const parentZone = el.closest('.routine-drop-zone');
          if (parentZone) el.dataset.fromZone = parentZone.id;
        }
      });
      el.addEventListener('dragend', () => {
        el.classList.remove('dragging');
      });
    };

    const createDumpItem = (text) => {
      const li = document.createElement('li');
      li.className = 'dump-item';
      li.draggable = true;
      li.innerText = text;
      setupDraggable(li);
      return li;
    };

    // Initialize existing items
    document.querySelectorAll('.dump-item, .routine-card').forEach(setupDraggable);

    if (dumpInput) {
      dumpInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && dumpInput.value.trim() !== '') {
          const newItem = createDumpItem(dumpInput.value.trim());
          dumpList.appendChild(newItem);
          dumpInput.value = '';
          newItem.style.animation = 'fadeInUp 0.3s ease';
        }
      });
    }

    // 3. Bidirectional Drag and Drop
    dropZones.forEach(zone => {
      zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        zone.classList.add('drag-over');
      });

      zone.addEventListener('dragleave', () => {
        zone.classList.remove('drag-over');
      });

      zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('drag-over');
        const text = e.dataTransfer.getData('text/plain');
        const draggingItem = document.querySelector('.dragging');
        const targetType = zone.getAttribute('data-type');

        if (!text || !draggingItem) return;

        // If dragging back to DUMP
        if (targetType === 'DUMP') {
          if (draggingItem.classList.contains('routine-card')) {
            const newItem = createDumpItem(draggingItem.querySelector('h3').innerText);
            dumpList.appendChild(newItem);
            draggingItem.remove();
          } else {
            dumpList.appendChild(draggingItem);
          }
        } 
        // If dragging to FOCUS/DROP/NOW
        else {
          const cardClassMap = { 'FOCUS': 'routine-card--focus', 'DROP': 'routine-card--drop-effect', 'NOW': 'routine-card--now' };
          
          // Fix: Ensure we extraction the core task title without extra elements
          let cardText = text;
          if (draggingItem.classList.contains('routine-card')) {
             const h3 = draggingItem.querySelector('h3');
             cardText = h3 ? h3.innerText : draggingItem.innerText;
          }

          const newCard = document.createElement('div');
          newCard.className = `routine-card ${cardClassMap[targetType] || ''}`;
          newCard.draggable = true;
          
          if (targetType === 'NOW') {
            newCard.innerHTML = `
              <div class="routine-content" style="flex:1;">
                <h3>${cardText}</h3>
              </div>
              <button class="button-primary btn-sm do-now-btn">완료</button>
            `;
          } else {
            newCard.innerHTML = `
              <div class="routine-content" style="flex:1;">
                <h3>${cardText}</h3>
              </div>
            `;
          }
          
          setupDraggable(newCard);

          const nowBtn = newCard.querySelector('.do-now-btn');
          if (nowBtn) {
            nowBtn.addEventListener('click', () => {
              if (typeof confetti === 'function') confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
              nowBtn.innerText = "완료!";
              nowBtn.disabled = true;
            });
          }

          const emptyState = zone.querySelector('.empty-drop-state');
          if (emptyState) emptyState.style.display = 'none';

          zone.appendChild(newCard);
          draggingItem.remove();
          
          // Use specific animation for dropped items
          newCard.style.opacity = '1';
          newCard.style.animation = 'fadeInUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';
        }
      });
    });

    // 4. AI Analysis Simulation
    if (startAiBtn) {
      startAiBtn.addEventListener('click', () => {
        if (aiLoading) aiLoading.classList.add('active');
        
        setTimeout(() => {
          // AI Logic: Distribute Brain Dump items based on energy
          const items = Array.from(dumpList.querySelectorAll('.dump-item'));
          const focusZone = document.getElementById('section-focus');
          const dropZone = document.getElementById('section-drop');
          
          if (items.length > 0) {
            items.forEach((item, index) => {
              const text = item.innerText;
              let targetZone;
              
              // Simple "Engine" logic
              if (userEnergy === 'low') {
                // In low energy, most go to DROP except maybe 1
                targetZone = (index === 0) ? focusZone : dropZone;
              } else {
                // In higher energy, more go to FOCUS
                targetZone = (index < 3) ? focusZone : dropZone;
              }

              const type = targetZone.getAttribute('data-type');
              const newCard = document.createElement('div');
              newCard.className = `routine-card ${type === 'NOW' ? 'routine-card--now' : (type === 'FOCUS' ? 'routine-card--focus' : 'routine-card--drop-effect')}`;
              newCard.draggable = true;
              newCard.innerHTML = `
                <div class="routine-content" style="flex:1;">
                  <h3>${text}</h3>
                </div>
              `;
              setupDraggable(newCard);
              
              const empty = targetZone.querySelector('.empty-drop-state');
              if (empty) empty.style.display = 'none';
              
              targetZone.appendChild(newCard);
              item.remove();
              newCard.style.opacity = '1';
              newCard.style.animation = 'fadeInUp 0.5s ease forwards';
            });
          }

          if (aiLoading) aiLoading.classList.remove('active');
          
          // Change button to proceed
          startAiBtn.innerText = "이대로 루틴 시작하기";
          startAiBtn.classList.remove('do-ai-analyze-btn');
          startAiBtn.classList.add('do-start-btn');
          // Add data-href for the generic start button logic if needed, or just inline
          startAiBtn.onclick = () => exitPage('reflection.html');
          
          // Confetti for success
          if (typeof confetti === 'function') {
            confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
          }
        }, 2500);
      });
    }
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
