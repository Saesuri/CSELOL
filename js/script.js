document.addEventListener('DOMContentLoaded', function () {
  console.log('Documento carregado.');

  const statsButtons = document.querySelectorAll(".stats-button");
  const modal = document.getElementById("statsModal");
  const modalContent = document.querySelector(".modal-content");
  const span = document.getElementsByClassName("close")[0];

  statsButtons.forEach(button => {
      button.addEventListener("click", function () {
          const url = button.getAttribute("data-url");
          if (url) {
              fetchMatchData('mftpsrl.json');
          }
          modal.style.display = "block";
      });
  });

  span.onclick = function () {
      modal.style.display = "none";
      modalContent.innerHTML = '<span class="close">&times;</span><div id="statsFrame"></div>';
  }

  window.onclick = function (event) {
      if (event.target == modal) {
          modal.style.display = "none";
          modalContent.innerHTML = '<span class="close">&times;</span><div id="statsFrame"></div>';
      }
  }

  function fetchMatchData(url) {
      fetch(url)
          .then(response => response.json())
          .then(data => displayMatchStats(data))
          .catch(error => console.error('Error fetching match data:', error));
  }

  function getItemUrl(itemId) {
      const baseUrl = "https://ddragon.leagueoflegends.com/cdn/14.15.1/img/item/";
      return baseUrl + itemId + ".png";
  }

  function getChampionIconUrl(championName) {
      const baseUrl = "https://ddragon.leagueoflegends.com/cdn/14.15.1/img/champion/";
      return baseUrl + championName + ".png";
  }

  function getSummonerSpellIconUrl(spellId) {
      const spellIdToIconUrlMap = {
          "4": "https://ddragon.leagueoflegends.com/cdn/14.15.1/img/spell/SummonerFlash.png",
          "12": "https://ddragon.leagueoflegends.com/cdn/14.15.1/img/spell/SummonerTeleport.png",
          "11": "https://ddragon.leagueoflegends.com/cdn/14.15.1/img/spell/SummonerSmite.png",
          "14": "https://ddragon.leagueoflegends.com/cdn/14.15.1/img/spell/SummonerDot.png",
          "3": "https://ddragon.leagueoflegends.com/cdn/14.15.1/img/spell/SummonerExhaust.png",
          "6": "https://ddragon.leagueoflegends.com/cdn/14.15.1/img/spell/SummonerHaste.png",
          "7": "https://ddragon.leagueoflegends.com/cdn/14.15.1/img/spell/SummonerHeal.png",
          "21": "https://ddragon.leagueoflegends.com/cdn/14.15.1/img/spell/SummonerBarrier.png",
          "1": "https://ddragon.leagueoflegends.com/cdn/14.15.1/img/spell/SummonerBoost.png",
      };
      return spellIdToIconUrlMap[spellId] || "";
  }

  function displayMatchStats(data) {
      const matchDetails = data.info.participants;
      let blueTeamHtml = '<div class="team-block team-blue"><h2>Equipe Azul</h2>';
      let redTeamHtml = '<div class="team-block team-red"><h2>Equipe Vermelha</h2>';

      matchDetails.forEach(participant => {
          const championIconUrl = getChampionIconUrl(participant.championName);
          const summonerSpell1IconUrl = getSummonerSpellIconUrl(participant.summoner1Id);
          const summonerSpell2IconUrl = getSummonerSpellIconUrl(participant.summoner2Id);

          const kda = ((participant.kills + participant.assists) / (participant.deaths || 1)).toFixed(2);
          const gameDurationMinutes = Math.floor(data.info.gameDuration / 60);
          const gameDurationSeconds = data.info.gameDuration % 60;
          const teamDamagePercentage = (participant.teamDamagePercentage * 100).toFixed(2);

          let playerHtml = `
          <div class="participant">
              <h3>${participant.summonerName}</h3>
              <p>Nível: ${participant.champLevel}</p>
              <img src="${championIconUrl}" alt="${participant.championName} icon" class="champion-icon">
              <div class="item-container">`;

          for (let i = 0; i < 6; i++) {
              const itemId = participant[`item${i}`];
              if (itemId) {
                  const itemUrl = getItemUrl(itemId);
                  playerHtml += `<img src="${itemUrl}" alt="Item ${i + 1}" class="item-image">`;
              }
          }

          playerHtml += `
              </div>
              <p>Feitiços:
                  <img src="${summonerSpell1IconUrl}" alt="Feitiço 1">
                  <img src="${summonerSpell2IconUrl}" alt="Feitiço 2">
              </p>
              <p>Abates: ${participant.kills}</p>
              <p>Mortes: ${participant.deaths}</p>
              <p>Assistências: ${participant.assists}</p>
              <p>KDA: ${kda}</p>
              <p>Tropas Abatidas: ${participant.totalMinionsKilled}</p>
              <p>Duração do Jogo: ${gameDurationMinutes}m ${gameDurationSeconds}s</p>
              <p>Ouro Ganhado: ${participant.goldEarned}</p>
              <p>Dano Total aos Campeões: ${participant.totalDamageDealtToChampions}</p>
              <p>Porcentagem de Dano da Equipe: ${teamDamagePercentage}%</p>
          </div>`;

          if (participant.teamId === 100) {
              blueTeamHtml += playerHtml;
          } else {
              redTeamHtml += playerHtml;
          }
      });

      blueTeamHtml += '</div>';
      redTeamHtml += '</div>';

      const statsHtml = blueTeamHtml + redTeamHtml;
      modalContent.innerHTML = '<span class="close">&times;</span>' + statsHtml;
  }
});
