<template>
  <div>
      <v-card
        color="transparent"
        flat
      >
        <v-tabs
          right
          color="orange accent-3"
          background-color="transparent"
          v-model="tab"
          grow
        >
          <v-tab
            v-if="first_batting_team"
          >
            {{first_batting_team.toUpperCase()}}
          </v-tab>
          <v-tab
            v-if="second_batting_team"
          >
            {{second_batting_team.toUpperCase()}}
          </v-tab>

          <v-tabs-items v-model="tab">
            <v-tab-item
              v-if="first_batting_team"
            >
              <v-row class="pb-5">
                <v-col md="6" class="mx-auto">
                  <v-data-table
                      :headers="batting_headers"
                      :items="first_batting"
                      class="elevation-1"
                      mobile-breakpoint="0"
                      hide-default-footer
                      disable-sort
                      :items-per-page="-1"
                  >
                    <template v-slot:[`item.name`]="{ item }">
                      {{ item.name }}
                      <div class="text-caption font-weight-light grey--text">{{ item.status }}</div>
                    </template>
                    <template
                      v-slot:[`body.append`]="{ headers }"
                    >
                      <tr>
                        <td :colspan="headers.length">
                          Extras: {{first_batting_extra}}
                        </td>
                      </tr>
                      <tr>
                        <td :colspan="headers.length">
                          Total: {{first_batting_total}}
                        </td>
                      </tr>
                    </template>
                  </v-data-table>
                    <v-divider class="pb-5"></v-divider>
                    <v-data-table
                      :headers="bowling_headers"
                      :items="first_bowling"
                      class="elevation-1"
                      mobile-breakpoint="0"
                      hide-default-footer
                      disable-sort
                      :items-per-page="-1"
                    >
                    </v-data-table>
                </v-col>
              </v-row>
            </v-tab-item>
  
            <v-tab-item
              v-if="second_batting_team"
            >
              <v-row class="pb-5">
                <v-col md="6" class="mx-auto">
                  <v-data-table
                      :headers="batting_headers"
                      :items="second_batting"
                      class="elevation-1"
                      mobile-breakpoint="0"
                      hide-default-footer
                      disable-sort
                      :items-per-page="-1"
                  >
                    <template v-slot:[`item.name`]="{ item }">
                      {{ item.name }}
                      <div class="text-caption font-weight-light grey--text">{{ item.status }}</div>
                    </template>
                    <template
                      v-slot:[`body.append`]="{ headers }"
                    >
                      <tr>
                        <td :colspan="headers.length">
                          Extras: {{second_batting_extra}}
                        </td>
                      </tr>
                      <tr>
                        <td :colspan="headers.length">
                          Total: {{second_batting_total}}
                        </td>
                      </tr>
                    </template>
                  </v-data-table>
                    <v-divider class="pb-5"></v-divider>
                    <v-data-table
                      :headers="bowling_headers"
                      :items="second_bowling"
                      class="elevation-1"
                      mobile-breakpoint="0"
                      hide-default-footer
                      disable-sort
                      :items-per-page="-1"
                    >
                    </v-data-table>
                </v-col>
              </v-row>
            </v-tab-item>

          </v-tabs-items>

          <v-tab-item>
          </v-tab-item>
        </v-tabs>
      </v-card>
  </div>
</template>

<script>

  import _ from 'lodash';
  import { doc, getDoc, collection, query, getDocs, orderBy } from "firebase/firestore";

  import db from '../db.js';  

  export default {
    name: 'HomeView',

    data: function () {
      return {
        tab: null,
        first_batting: [],
        first_bowling: [],
        second_batting: [],
        second_bowling: [],
        first_batting_team: null,
        first_bowling_team: null,
        second_batting_team: null,
        second_bowling_team: null,
        first_batting_extra: null,
        first_batting_total: null,
        second_batting_extra: null,
        second_batting_total: null,
        batting_headers: [
          { text: 'Batting', align: 'start', value: 'name', width: '100%'},
          { text: 'R', value: 'score', align: 'end'  },
          { text: 'B', value: 'balls', align: 'end'  },
          { text: '4s', value: 'four', align: 'end'  },
          { text: '6s', value: 'six', align: 'end'  },
          { text: 'S/R', value: 'sr', align: 'end' },
        ],
        bowling_headers: [
          { text: 'Bowling', align: 'start', value: 'name', width: '100%'},
          { text: 'O', value: 'overs', align: 'end'  },
          { text: 'M', value: 'maiden', align: 'end'  },
          { text: 'R', value: 'score', align: 'end'  },
          { text: 'W', value: 'wickets', align: 'end'  },
          { text: 'Econ', value: 'econ', align: 'end' },
        ],
      }
    },

  async mounted(){

    const configRef = doc(db, "main", "config");
    const configSnap = await getDoc(configRef);

    if (configSnap.exists()) {
      this.first_batting_team = _.get(configSnap.data().inningOrder[0], 'team', null);
      this.first_bowling_team = _.get(configSnap.data().inningOrder[0], 'team', null);
      this.second_batting_team = _.get(configSnap.data().inningOrder[1], 'team', null);
      this.second_bowling_team = _.get(configSnap.data().inningOrder[1], 'team', null);
    }

    const bowling_q = query(collection(db, "bowling"), orderBy("timestamp"));

    const bowlingSnapshot = await getDocs(bowling_q);
    bowlingSnapshot.forEach((doc) => {

      var bowling_row = doc.data();
      var overs = 0;
      var econ = 0;
      
      if (doc.data().team === this.first_bowling_team && doc.data().inning === 1){

        overs = Math.floor(doc.data().balls/6)+(doc.data().balls%6)/10;
        bowling_row.overs = overs;

        econ = doc.data().score/overs
        bowling_row.econ = econ.toFixed(2);

        this.first_bowling.push(bowling_row);
      }

      if (doc.data().team === this.second_bowling_team && doc.data().inning === 1){

        overs = Math.floor(doc.data().balls/6)+(doc.data().balls%6)/10;
        bowling_row.overs = overs;

        econ = doc.data().score/overs
        bowling_row.econ = econ.toFixed(2);

        this.second_bowling.push(bowling_row);
      }
    });

    const batting_q = query(collection(db, "batting"), orderBy("timestamp"));

    const battingSnapshot = await getDocs(batting_q);
    battingSnapshot.forEach((doc) => {

      var batting_row = doc.data();
      var sr = 0;
      
      if (doc.data().team === this.first_batting_team && doc.data().inning === 1){
        sr = (doc.data().score/doc.data().balls)*100
        batting_row.sr = sr.toFixed(2);
        this.first_batting.push(batting_row);
      }

      if (doc.data().team === this.second_batting_team && doc.data().inning === 1){
        sr = (doc.data().score/doc.data().balls)*100
        batting_row.sr = sr.toFixed(2);
        this.second_batting.push(batting_row);
      }
    });

    const inning_q = query(collection(db, "innings"));

    const inningSnapshot = await getDocs(inning_q);
    inningSnapshot.forEach((doc) => {
      if (doc.data().team === this.first_batting_team && doc.data().inning === 1){
        this.first_batting_total = doc.data().score;

        var extras = doc.data().extra.total + " ( "
        if (doc.data().extra.b > 0){
          extras = extras + "b "+doc.data().extra.b+" ";
        }
        if (doc.data().extra.lb > 0){
          extras = extras + "lb " + doc.data().extra.lb + " "
        }
        if (doc.data().extra.nb > 0){
          extras = extras + "nb " + doc.data().extra.nb + " "
        }
        if (doc.data().extra.wd > 0){
          extras = extras + "wd " + doc.data().extra.wd + " "
        }
        extras = extras+")"

        this.first_batting_extra = extras;
      }
      if (doc.data().team === this.second_batting_team && doc.data().inning === 1){
        this.second_batting_total = doc.data().score;

        extras = doc.data().extra.total + " ( "
        if (doc.data().extra.b > 0){
          extras = extras + "b "+doc.data().extra.b+" ";
        }
        if (doc.data().extra.lb > 0){
          extras = extras + "lb " + doc.data().extra.lb + " "
        }
        if (doc.data().extra.nb > 0){
          extras = extras + "nb " + doc.data().extra.nb + " "
        }
        if (doc.data().extra.wd > 0){
          extras = extras + "wd " + doc.data().extra.wd + " "
        }
        extras = extras+")"

        this.second_batting_extra = extras;
      }
    });

  },

  }
</script>
